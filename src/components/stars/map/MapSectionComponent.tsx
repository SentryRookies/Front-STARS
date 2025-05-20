import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl, { LngLatLike, NavigationControl } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { usePlace } from "../../../context/PlaceContext";
import SearchBar from "./SearchBar";
import useCustomLogin from "../../../hooks/useCustomLogin";
import AlertModal from "../../alert/AlertModal";
import useCongestionAlert from "../../../hooks/useCongestionAlert";
import { getAreaList } from "../../../api/starsApi";
import AreaFocusCard from "./AreaFocusCard";
import { SearchResult } from "../../../api/searchApi";
import type { Feature, Point } from "geojson"; // 추가
import PlaceSuggestionBtn from "./PlaceSuggestionBtn";


mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const categoryMap: Record<string, string> = {
    accommodation: "숙박",
    attraction: "관광명소",
    cafe: "카페",
    restaurant: "음식점",
    cultural_event: "문화행사",
};

interface Area {
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
    const searchMarkersRef = useRef<
        { marker: mapboxgl.Marker; item: SearchResult }[]
    >([]);

    const {
        selectedAreaId,
        setSelectedAreaId,
        setTriggerCountUp, // triggerCountUp 미사용이므로 제거
    } = usePlace();
    const [showFocusCard, setShowFocusCard] = useState(false);
    const { alerts, dismissAlert } = useCongestionAlert();
    const { isLogin } = useCustomLogin();

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

                // 클릭 이벤트
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
                        const safeZoom = zoom != null ? zoom : undefined; // null 체크
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

    const handleSearchResultClick = useCallback((items: SearchResult[]) => {
        const map = mapRef.current;
        if (!map) return;

        searchMarkersRef.current.forEach(({ marker }) => marker.remove());
        searchMarkersRef.current = [];

        items.forEach((item) => {
            const el = document.createElement("div");
            el.className = "custom-marker";

            const popup = new mapboxgl.Popup({
                offset: 10,
                closeButton: false,
            }).setHTML(
                `<div class="flex flex-col p-2 gap-2">
                                <h3 class="font-bold text-xl text-gray-700">${item.name}</h3>
                                <span class="text-md text-gray-500">${categoryMap?.[item.type] ?? item.type}</span>
                                <p class="text-gray-700">${item.address}</p>
                            </div>`
            );

            const marker = new mapboxgl.Marker({ element: el })
                .setLngLat([item.lon, item.lat])
                .setPopup(popup)
                .addTo(map);

            searchMarkersRef.current.push({ marker, item });
        });

        if (items.length > 0) {
            map.flyTo({
                center: [items[0].lon, items[0].lat],
                zoom: 15,
                pitch: 45,
            });
            setShowFocusCard(false);
        }
    }, []);

    const handleSingleResultClick = useCallback((item: SearchResult) => {
        const map = mapRef.current;
        if (!map) return;
        searchMarkersRef.current.forEach(({ marker }) =>
            marker.getPopup()?.remove()
        );
        const found = searchMarkersRef.current.find(
            (m) => m.item.name === item.name && m.item.address === item.address
        );
        if (found) {
            map.flyTo({
                center: [item.lon, item.lat],
                zoom: 17,
                pitch: 45,
            });
            found.marker.togglePopup();
        }
    }, []);

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

            {/* 챗봇 */}
            <PlaceSuggestionBtn />

            {/* Mapbox 지도 */}
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
