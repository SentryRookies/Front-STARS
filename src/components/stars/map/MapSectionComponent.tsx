import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl, { LngLatLike, NavigationControl } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { usePlace } from "../../../context/PlaceContext";
import SearchBar from "../search/SearchBar";
import useCustomLogin from "../../../hooks/useCustomLogin";
import AlertModal from "../../alert/AlertModal";
import useCongestionAlert from "../../../hooks/useCongestionAlert";
import { getAreaList } from "../../../api/starsApi";
import AreaFocusCard from "./AreaFocusCard";
import { SearchResult } from "../../../api/searchApi";
import type { Feature, Point } from "geojson";
import {
    getUserFavoriteList,
    addFavorite,
    deleteFavorite,
} from "../../../api/mypageApi";
import { Favorite } from "../../../data/adminData";
import { AccidentAlertModal } from "../../alert/AccidentModal";
import PlaceSuggestion from "../suggestion/PlaceSuggestion";
import { LocationControl } from "./CustomControl";
import FavoriteAlertModal from "../../alert/FavoriteAlertModal";
import CustomPopupCard from "./CustomPopupCard";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const categoryMap: Record<string, string> = {
    accommodation: "숙박",
    attraction: "관광명소",
    cafe: "카페",
    restaurant: "음식점",
    cultural_event: "문화행사",
    culturalevent: "문화행사",
};

const categoryBadge: Record<string, string> = {
    accommodation: "bg-blue-100 text-blue-700",
    attraction: "bg-green-100 text-green-700",
    cafe: "bg-yellow-100 text-yellow-700",
    restaurant: "bg-red-100 text-red-700",
    cultural_event: "bg-purple-100 text-purple-700",
    culturalevent: "bg-purple-100 text-purple-700",
};

export interface Area {
    area_id: number | null;
    area_name: string;
    lat: number;
    lon: number;
    category: string;
    name_eng: string;
}

export default function MapSectionComponent({
    searchKeyword,
    onSearchComplete,
}: {
    searchKeyword?: string | null;
    onSearchComplete?: () => void;
}) {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const searchMarkersRef = useRef<
        { marker: mapboxgl.Marker; item: SearchResult }[]
    >([]);

    const {
        selectedAreaId,
        setSelectedAreaId,
        setTriggerCountUp,
        accidentData,
        highlightPOI,
        setHighlightPOI,
    } = usePlace();
    const [showFocusCard, setShowFocusCard] = useState(false);
    const { alerts, dismissAlert } = useCongestionAlert();
    const { isLogin } = useCustomLogin();
    const [favoriteList, setFavoriteList] = useState<Favorite[]>([]);

    const [popupCard, setPopupCard] = useState<{
        item: SearchResult;
        position: { x: number; y: number };
    } | null>(null);

    // ✅ toggledFavorites 제거하고 즐겨찾기 상태는 favoriteList로만 관리
    const isAnimatingRef = useRef(false);

    const getItemKey = (type: string, place_id: string | number) =>
        `${type}:${String(place_id)}`;

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [AlertType, setAlertType] = useState<"success" | "remove">("success");

    // ✅ 즐겨찾기 목록 새로고침 함수
    const refreshFavoriteList = useCallback(async () => {
        if (!isLogin) {
            setFavoriteList([]);
            return;
        }
        try {
            const favorites = await getUserFavoriteList();
            setFavoriteList(favorites);
        } catch (error) {
            console.error("즐겨찾기 목록 새로고침 실패:", error);
        }
    }, [isLogin]);

    useEffect(() => {
        refreshFavoriteList();
    }, [refreshFavoriteList]);

    // ✅ 페이지 포커스 시 즐겨찾기 목록 새로고침 (다른 페이지에서 변경사항 있을 때)
    useEffect(() => {
        const handleFocus = () => {
            refreshFavoriteList();
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [refreshFavoriteList]);

    const handleMarkerClick = useCallback(
        async (item: SearchResult, coordinates: [number, number]) => {
            const map = mapRef.current;
            if (!map) return;

            // ✅ 카드 띄우기 전에 즐겨찾기 목록 새로고침
            await refreshFavoriteList();

            const point = map.project(coordinates);

            setPopupCard({
                item,
                position: { x: point.x, y: point.y },
            });
        },
        [refreshFavoriteList]
    );

    // ✅ 즐겨찾기 토글 핸들러 - 카드 열 때마다 최신 상태 확인
    const handleFavoriteToggle = async (item: SearchResult) => {
        // ✅ 토글 전에도 최신 즐겨찾기 상태 확인
        await refreshFavoriteList();

        const currentState = isItemFavorite(item.type, item.place_id);

        try {
            if (currentState) {
                await deleteFavorite({
                    type: item.type,
                    place_id: item.place_id,
                });
                setAlertMessage("즐겨찾기에서 제거되었습니다.");
                setAlertType("remove");

                // ✅ 즉시 favoriteList에서 제거
                setFavoriteList((prev) =>
                    prev.filter(
                        (f) =>
                            !(
                                f.type === item.type &&
                                String(f.place_id) === String(item.place_id)
                            )
                    )
                );
            } else {
                const response = await addFavorite({
                    type: item.type,
                    place_id: item.place_id,
                });
                setAlertMessage("즐겨찾기에 추가되었습니다.");
                setAlertType("success");

                // ✅ API 완료 후 최신 즐겨찾기 목록 다시 가져오기
                await refreshFavoriteList();
            }

            setAlertOpen(true);
        } catch (error) {
            console.error("즐겨찾기 변경 실패", error);
            // ✅ 에러 발생 시에도 최신 상태로 새로고침
            await refreshFavoriteList();
        }
    };

    useEffect(() => {
        if (!highlightPOI || !mapRef.current) return;

        const map = mapRef.current;

        searchMarkersRef.current.forEach(({ marker }) => marker.remove());
        searchMarkersRef.current = [];

        const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.width = "24px";
        el.style.height = "24px";
        el.style.backgroundColor = "#8b5cf6";
        el.style.borderRadius = "50%";

        el.addEventListener("click", () => {
            handleMarkerClick(highlightPOI, [
                highlightPOI.lon,
                highlightPOI.lat,
            ]);
        });

        const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([highlightPOI.lon, highlightPOI.lat])
            .addTo(map);

        searchMarkersRef.current.push({ marker, item: highlightPOI });

        map.flyTo({
            center: [highlightPOI.lon, highlightPOI.lat],
            zoom: 17,
            pitch: 45,
            duration: 800,
        });

        setTimeout(() => {
            handleMarkerClick(highlightPOI, [
                highlightPOI.lon,
                highlightPOI.lat,
            ]);
        }, 900);

        setHighlightPOI(null);
    }, [highlightPOI, handleMarkerClick]);

    // ✅ 즐겨찾기 상태 확인 - toggledFavorites 제거하고 favoriteList만 사용
    const isItemFavorite = useCallback(
        (type: string, place_id: string | number) => {
            return favoriteList.some(
                (f) =>
                    f.type === type && String(f.place_id) === String(place_id)
            );
        },
        [favoriteList] // toggledFavorites 의존성 제거
    );

    useEffect(() => {
        if (!mapContainer.current) return;

        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/minseoks/cm99i4icd00fe01r9gia5c055",
            center: [126.9779692, 37.566535] as LngLatLike,
            zoom: 10.8,
            minZoom: 10,
        });

        map.addControl(
            new NavigationControl({
                visualizePitch: true,
            }),
            "right"
        );
        map.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                trackUserLocation: true,
                showUserHeading: true,
            }),
            "right"
        );
        map.addControl(new LocationControl(), "right");

        mapRef.current = map;

        map.on("move", () => {
            setPopupCard(null);
        });

        getAreaList().then((areaList: Area[]) => {
            const features: Feature<Point>[] = areaList.map((area) => ({
                type: "Feature",
                properties: {
                    area_id: area.area_id,
                    area_name: area.area_name,
                },
                geometry: {
                    type: "Point",
                    coordinates: [area.lon, area.lat],
                },
            }));

            map.on("load", () => {
                map.addSource("areas", {
                    type: "geojson",
                    data: {
                        type: "FeatureCollection",
                        features,
                    },
                    cluster: true,
                    clusterMaxZoom: 16,
                    clusterRadius: 40,
                });

                map.addLayer({
                    id: "clusters",
                    type: "circle",
                    source: "areas",
                    filter: ["has", "point_count"],
                    paint: {
                        "circle-color": "rgba(40,140,255,0.4)",
                        "circle-radius": [
                            "step",
                            ["get", "point_count"],
                            20,
                            4,
                            24,
                            7,
                            28,
                            10,
                            32,
                            13,
                            36,
                            16,
                            40,
                            19,
                            44,
                            22,
                            48,
                            25,
                            52,
                            28,
                            56,
                        ],
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#fff",
                    },
                });

                map.addLayer({
                    id: "unclustered-point",
                    type: "circle",
                    source: "areas",
                    filter: ["!", ["has", "point_count"]],
                    paint: {
                        "circle-color": "rgba(40,140,255,0.8)",
                        "circle-radius": 12,
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#fff",
                    },
                });

                map.addLayer({
                    id: "cluster-count",
                    type: "symbol",
                    source: "areas",
                    filter: ["has", "point_count"],
                    layout: {
                        "text-field": "{point_count_abbreviated}",
                        "text-font": [
                            "Open Sans Bold",
                            "Arial Unicode MS Bold",
                        ],
                        "text-size": 14,
                    },
                    paint: {
                        "text-color": "#288cff",
                    },
                });

                map.on("click", "clusters", (e) => {
                    const features = map.queryRenderedFeatures(e.point, {
                        layers: ["clusters"],
                    });
                    const clusterId = features[0].properties?.cluster_id;
                    const source = map.getSource(
                        "areas"
                    ) as mapboxgl.GeoJSONSource;
                    source.getClusterExpansionZoom(clusterId, (err, zoom) => {
                        if (err) return;
                        const safeZoom = zoom != null ? zoom : undefined;
                        map.easeTo({
                            center: (features[0].geometry as Point)
                                .coordinates as [number, number],
                            zoom: safeZoom,
                        });
                    });
                });

                map.on("click", "unclustered-point", (e) => {
                    const feature = e.features?.[0] as Feature<Point>;
                    if (!feature) return;
                    const areaId = feature.properties?.area_id;
                    setSelectedAreaId(areaId != null ? areaId : undefined);
                    map.flyTo({
                        center: feature.geometry.coordinates as [
                            number,
                            number,
                        ],
                        zoom: 16,
                        pitch: 45,
                    });
                    map.once("moveend", () => {
                        requestAnimationFrame(() => {
                            setShowFocusCard(true);
                        });
                    });
                });

                map.on("mouseenter", "clusters", () => {
                    map.getCanvas().style.cursor = "pointer";
                });
                map.on("mouseleave", "clusters", () => {
                    map.getCanvas().style.cursor = "";
                });
                map.on("mouseenter", "unclustered-point", () => {
                    map.getCanvas().style.cursor = "pointer";
                });
                map.on("mouseleave", "unclustered-point", () => {
                    map.getCanvas().style.cursor = "";
                });
            });
        });

        return () => map.remove();
    }, [setSelectedAreaId]);

    const handleViewArea = (areaId: number) => {
        getAreaList().then((areaList: Area[]) => {
            const area = areaList.find((a) => a.area_id === areaId);
            if (area && mapRef.current) {
                mapRef.current.flyTo({
                    center: [area.lon, area.lat],
                    zoom: 15,
                    pitch: 45,
                });
                setSelectedAreaId(areaId);
                mapRef.current.once("moveend", () => {
                    requestAnimationFrame(() => {
                        setShowFocusCard(true);
                    });
                });
            }
        });
    };

    const handleSearchResultClick = useCallback(
        (items: SearchResult[]) => {
            const map = mapRef.current;
            if (!map) return;

            searchMarkersRef.current.forEach(({ marker }) => marker.remove());
            searchMarkersRef.current = [];

            items.forEach((item) => {
                const el = document.createElement("div");
                el.className = "custom-marker";

                el.addEventListener("click", () => {
                    handleMarkerClick(item, [item.lon, item.lat]);
                });

                const marker = new mapboxgl.Marker({ element: el })
                    .setLngLat([item.lon, item.lat])
                    .addTo(map);

                searchMarkersRef.current.push({ marker, item });
            });

            if (items.length > 0) {
                map.flyTo({
                    center: [items[0].lon, items[0].lat],
                    zoom: 15,
                    pitch: 45,
                    duration: 500,
                    easing: (t) => t * (2 - t),
                });
                setShowFocusCard(false);
            }
        },
        [handleMarkerClick, setSelectedAreaId]
    );

    const handleSingleResultClick = useCallback(
        (item: SearchResult) => {
            const map = mapRef.current;
            if (!map || isAnimatingRef.current) return;

            if (!item.lon || !item.lat || isNaN(item.lon) || isNaN(item.lat)) {
                console.warn("Invalid coordinates:", item);
                return;
            }

            setPopupCard(null);

            const found = searchMarkersRef.current.find(
                (m) =>
                    m.item.name === item.name && m.item.address === item.address
            );

            if (found) {
                isAnimatingRef.current = true;
                map.stop();

                const onMoveEnd = async () => {
                    map.off("moveend", onMoveEnd);
                    isAnimatingRef.current = false;
                    // ✅ 카드 표시 전 즐겨찾기 새로고침
                    await refreshFavoriteList();
                    handleMarkerClick(item, [item.lon, item.lat]);
                };

                map.on("moveend", onMoveEnd);

                map.flyTo({
                    center: [item.lon, item.lat],
                    zoom: 17,
                    pitch: 45,
                    essential: true,
                });

                setTimeout(async () => {
                    if (isAnimatingRef.current) {
                        map.off("moveend", onMoveEnd);
                        isAnimatingRef.current = false;
                        // ✅ 타임아웃 시에도 즐겨찾기 새로고침
                        await refreshFavoriteList();
                        handleMarkerClick(item, [item.lon, item.lat]);
                    }
                }, 1000);
            }
        },
        [handleMarkerClick]
    );

    return (
        <div className="relative w-screen app-full-height">
            {isLogin && (
                <div className="absolute bottom-4 right-4 z-10">
                    <button
                        className="bg-white shadow-md px-6 py-3 text-indigo-500 font-semibold rounded-full hover:bg-indigo-500 hover:text-white transition"
                        onClick={() => window.fullpage_api?.moveSlideRight()}
                    >
                        MyPage →
                    </button>
                </div>
            )}

            <SearchBar
                keyword={searchKeyword ?? undefined}
                onKeywordSearched={onSearchComplete}
                onResultClick={handleSearchResultClick}
                onSingleResultClick={handleSingleResultClick}
            />

            <PlaceSuggestion />

            <div className="w-full h-full" ref={mapContainer} />

            <CustomPopupCard
                item={popupCard?.item || null}
                position={popupCard?.position || null}
                onClose={() => setPopupCard(null)}
                onFavoriteToggle={handleFavoriteToggle}
                onDetailClick={(areaId) => {
                    setSelectedAreaId(areaId);
                    setShowFocusCard(true);
                }}
                isItemFavorite={isItemFavorite}
                isLogin={isLogin}
            />

            {selectedAreaId && (
                <AreaFocusCard
                    areaId={selectedAreaId}
                    show={showFocusCard}
                    onClose={() => setShowFocusCard(false)}
                    onDetail={() => {
                        setShowFocusCard(false);
                        setTriggerCountUp(true);
                        window.fullpage_api?.moveSectionDown();
                    }}
                    onCategoryClick={handleSearchResultClick}
                />
            )}

            <AccidentAlertModal
                accidents={accidentData}
                onViewArea={handleViewArea}
            />

            <AlertModal
                alerts={alerts}
                onDismiss={dismissAlert}
                onViewArea={handleViewArea}
            />

            <FavoriteAlertModal
                open={alertOpen}
                message={alertMessage}
                type={AlertType}
                onClose={() => setAlertOpen(false)}
            />
        </div>
    );
}
