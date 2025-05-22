import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import mapboxgl, { LngLatLike, NavigationControl } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { usePlace } from "../../../context/PlaceContext";
import SearchBar from "./SearchBar";
import useCustomLogin from "../../../hooks/useCustomLogin";
import AlertModal from "../../alert/AlertModal";
import useCongestionAlert from "../../../hooks/useCongestionAlert";
import AreaFocusCard from "./AreaFocusCard";
import { SearchResult } from "../../../api/searchApi";
import type { Feature, Point } from "geojson";
import useAreaList from "../../../hooks/useAreaList";
import useFavorites from "../../../hooks/useFavorites";
import { useMapMarkers } from "../../../hooks/useMapMarkers";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export interface Area {
    area_id: number | null;
    area_name: string;
    lat: number;
    lon: number;
    category: string;
    name_eng: string;
}

export default function MapSectionComponent() {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);

    const { selectedAreaId, setSelectedAreaId, setTriggerCountUp } = usePlace();
    const [showFocusCard, setShowFocusCard] = useState(false);
    const { alerts, dismissAlert } = useCongestionAlert();
    const { isLogin } = useCustomLogin();

    // Use custom hooks for optimization
    const { areaList } = useAreaList();
    const { isItemFavorite, addToFavorites, removeFromFavorites } =
        useFavorites();
    const mapMarkers = useMapMarkers(mapRef);

    // Memoize features to avoid recalculation
    const areaFeatures = useMemo(() => {
        return areaList.map((area) => ({
            type: "Feature" as const,
            properties: {
                area_id: area.area_id,
                area_name: area.area_name,
            },
            geometry: {
                type: "Point" as const,
                coordinates: [area.lon, area.lat],
            },
        }));
    }, [areaList]);

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

        mapRef.current = map;

        // Setup favorite toggle event listener
        const handleFavoriteToggle = (e: Event) => {
            const customEvent = e as CustomEvent;
            const { type, placeId, element } = customEvent.detail;

            if (!isLogin) {
                alert("즐겨찾기 기능은 로그인 후 이용 가능합니다.");
                return;
            }

            const isFav = isItemFavorite(type, placeId);

            // Update UI immediately
            const svg = element.querySelector("svg");
            if (svg) {
                if (isFav) {
                    svg.classList.add("text-gray-300");
                    svg.classList.remove("text-yellow-300");
                } else {
                    svg.classList.add("text-yellow-300");
                    svg.classList.remove("text-gray-300");
                }
            }

            // Call API
            if (isFav) {
                removeFromFavorites(type, placeId);
            } else {
                addToFavorites(type, placeId);
            }
        };

        document.addEventListener("favorite-toggle", handleFavoriteToggle);

        // Initialize map when it's loaded
        map.on("load", () => {
            // Add area data source
            map.addSource("areas", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: areaFeatures,
                },
                cluster: true,
                clusterMaxZoom: 16,
                clusterRadius: 40,
            });

            // 클러스터 레이어
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
                        20, // 1~3개
                        4,
                        24, // 4~6개
                        7,
                        28, // 7~9개
                        10,
                        32, // 10~12개
                        13,
                        36, // 13~15개
                        16,
                        40, // 16~18개
                        19,
                        44, // 19~21개
                        22,
                        48, // 22~24개
                        25,
                        52, // 25~27개
                        28,
                        56, // 28개 이상
                    ],
                    "circle-stroke-width": 2,
                    "circle-stroke-color": "#fff",
                },
            });

            // 개별 마커(1개짜리) 레이어
            map.addLayer({
                id: "unclustered-point",
                type: "circle",
                source: "areas",
                filter: ["!", ["has", "point_count"]],
                paint: {
                    "circle-color": "rgba(40,140,255,0.8)",
                    "circle-radius": 12, // 1개짜리 크기 조절
                    "circle-stroke-width": 2,
                    "circle-stroke-color": "#fff",
                },
            });

            // 클러스터 숫자
            map.addLayer({
                id: "cluster-count",
                type: "symbol",
                source: "areas",
                filter: ["has", "point_count"],
                layout: {
                    "text-field": "{point_count_abbreviated}",
                    "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
                    "text-size": 14,
                },
                paint: {
                    "text-color": "#288cff",
                },
            });

            // 클릭 이벤트
            map.on("click", "clusters", (e) => {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: ["clusters"],
                });
                const clusterId = features[0].properties?.cluster_id;
                const source = map.getSource("areas") as mapboxgl.GeoJSONSource;
                source.getClusterExpansionZoom(clusterId, (err, zoom) => {
                    if (err) return;
                    const safeZoom = zoom != null ? zoom : undefined; // null 체크
                    map.easeTo({
                        center: (features[0].geometry as Point).coordinates as [
                            number,
                            number,
                        ],
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
                    center: feature.geometry.coordinates as [number, number],
                    zoom: 16,
                    pitch: 45,
                });
                map.once("moveend", () => {
                    requestAnimationFrame(() => {
                        setShowFocusCard(true);
                    });
                });
            });

            // 마우스 커서 변경
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

        return () => {
            document.removeEventListener(
                "favorite-toggle",
                handleFavoriteToggle
            );
            map.remove();
        };
    }, [
        areaFeatures,
        setSelectedAreaId,
        isLogin,
        isItemFavorite,
        addToFavorites,
        removeFromFavorites,
    ]);

    // Optimize handleViewArea to use cached areaList
    const handleViewArea = useCallback(
        (areaId: number) => {
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
        },
        [areaList, mapRef, setSelectedAreaId, setShowFocusCard]
    );

    // Removed renderPopupHTML and bindPopupEvents functions
    // They are now handled by the MapPopup component and useMapMarkers hook

    // Optimized to use mapMarkers hook
    const handleSearchResultClick = useCallback(
        (items: SearchResult[]) => {
            if (!mapRef.current) return;
            mapMarkers.createMarkers(
                items,
                setSelectedAreaId,
                setShowFocusCard
            );
        },
        [mapMarkers, setSelectedAreaId, setShowFocusCard]
    );

    // Optimized to use mapMarkers hook
    const handleSingleResultClick = useCallback(
        (item: SearchResult) => {
            if (!mapRef.current) return;
            mapMarkers.focusMarker(item);
        },
        [mapMarkers]
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
                onResultClick={handleSearchResultClick}
                onSingleResultClick={handleSingleResultClick}
            />

            <div className="w-full h-full" ref={mapContainer} />

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
            <AlertModal
                alerts={alerts}
                onDismiss={dismissAlert}
                onViewArea={handleViewArea}
            />
        </div>
    );
}
