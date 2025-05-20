import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { LngLatLike, NavigationControl } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ParkNode, TrafficData } from "../../data/adminData";
import MapboxLanguage from "@mapbox/mapbox-gl-language";

// Set mapbox token - move outside component to avoid re-initialization
if (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN) {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
}

interface TrafficMapProps {
    trafficData?: TrafficData;
    parkData?: { prk_stts: ParkNode[] }; // ParkData 중 ParkNode[]만 받아씀
    initialCenter?: LngLatLike;
    initialZoom?: number;
    height?: string;
    width?: string;
}

const TrafficMap: React.FC<TrafficMapProps> = ({
    trafficData,
    parkData,
    initialCenter = [126.978, 37.5665] as LngLatLike, // Default to Seoul
    initialZoom = 11,
    height = "500px",
    width = "100%",
}) => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const markerRefs = useRef<mapboxgl.Marker[]>([]);
    const parkingMarkerRefs = useRef<mapboxgl.Marker[]>([]);

    // 현재 지도 중심 좌표와 줌 레벨을 상태로 관리
    const [currentCenter, setCurrentCenter] =
        useState<LngLatLike>(initialCenter);
    const [currentZoom, setCurrentZoom] = useState<number>(initialZoom);

    // 이동 완료 플래그 (불필요한 flyTo 호출 방지용)
    const [flyCompleted, setFlyCompleted] = useState<boolean>(true);

    // Track previous data to determine when new data comes in
    const prevTrafficDataRef = useRef<TrafficData | undefined>(undefined);
    const prevParkDataRef = useRef<{ prk_stts: ParkNode[] } | undefined>(
        undefined
    );

    console.log("Traffic Data: ", trafficData);
    console.log("Park Data: ", parkData);

    // Helper function to convert LngLatLike to [number, number]
    const toLngLatArray = (coord: LngLatLike): [number, number] => {
        if (Array.isArray(coord)) {
            return [coord[0], coord[1]];
        } else if (coord instanceof mapboxgl.LngLat) {
            return [coord.lng, coord.lat];
        } else if (
            typeof coord === "object" &&
            "lng" in coord &&
            "lat" in coord
        ) {
            return [coord.lng, coord.lat];
        }
        // Default fallback - should never reach here if properly typed
        console.warn("Invalid coordinate format", coord);
        return [0, 0];
    };

    // 지도 초기화
    useEffect(() => {
        if (!mapContainer.current) return;

        // Make sure we have a valid token
        if (!mapboxgl.accessToken) {
            console.error("Mapbox token is not set");
            return;
        }

        // 지도 초기화 - 현재 저장된 중심 좌표와 줌 레벨 사용
        const mapInstance = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/light-v11",
            center: currentCenter,
            zoom: currentZoom,
            interactive: true,
        });

        // 지도 이동이 끝날 때마다 현재 중심 좌표와 줌 레벨 업데이트
        mapInstance.on("moveend", () => {
            if (mapInstance) {
                const center = mapInstance.getCenter();
                const zoom = mapInstance.getZoom();
                setCurrentCenter([center.lng, center.lat]);
                setCurrentZoom(zoom);
                setFlyCompleted(true);
            }
        });

        // 유저가 지도를 수동으로 이동시키면 현재 위치 업데이트
        mapInstance.on("dragend", () => {
            if (mapInstance) {
                const center = mapInstance.getCenter();
                const zoom = mapInstance.getZoom();
                setCurrentCenter([center.lng, center.lat]);
                setCurrentZoom(zoom);
            }
        });

        // 유저가 지도를 확대/축소하면 현재 줌 레벨 업데이트
        mapInstance.on("zoomend", () => {
            if (mapInstance) {
                const zoom = mapInstance.getZoom();
                setCurrentZoom(zoom);
            }
        });

        // Only add controls and set up events after the map is created
        mapInstance.on("load", () => {
            console.log("Map loaded");

            mapInstance.addControl(
                new NavigationControl({
                    visualizePitch: true,
                }),
                "right"
            );

            try {
                mapInstance.addControl(
                    new MapboxLanguage({
                        defaultLanguage: "ko",
                    })
                );
            } catch (error) {
                console.error("Failed to add language control:", error);
            }

            setMapLoaded(true);

            // Only try to add data after the map is fully loaded
            setTimeout(() => {
                if (trafficData) {
                    drawRoadsForArea(mapInstance, trafficData);
                }

                if (parkData && parkData.prk_stts) {
                    drawParkingMarkersForArea(mapInstance, parkData.prk_stts);
                }
            }, 500);
        });

        map.current = mapInstance;

        // Clean up on unmount
        return () => {
            if (map.current) {
                // Remove all markers first
                markerRefs.current.forEach((marker) => marker.remove());
                parkingMarkerRefs.current.forEach((marker) => marker.remove());

                // Then remove the map
                map.current.remove();

                // Reset refs
                map.current = null;
                markerRefs.current = [];
                parkingMarkerRefs.current = [];
            }
        };
    }, []); // 처음 마운트될 때만 실행

    // 새로운 데이터가 들어오면 해당 영역으로 이동하는 기능 추가
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        // Check if either traffic or park data has changed
        const trafficDataChanged = trafficData !== prevTrafficDataRef.current;
        const parkDataChanged = parkData !== prevParkDataRef.current;

        // Only move if new data has arrived
        if ((trafficDataChanged || parkDataChanged) && flyCompleted) {
            moveToSelectedArea();

            // Update prev refs
            prevTrafficDataRef.current = trafficData;
            prevParkDataRef.current = parkData;
        }
    }, [trafficData, parkData, mapLoaded, flyCompleted]);

    // 선택된 영역으로 지도 이동 및 데이터 표시
    const moveToSelectedArea = () => {
        if (!map.current) return;

        let centerLng, centerLat;
        let zoomLevel = 14;

        // 교통 데이터가 있으면 모든 도로 세그먼트의 종점들의 중심점을 계산
        if (trafficData && trafficData.road_traffic_stts.length > 0) {
            // 종점들의 모든 좌표를 수집
            const allEndpoints: [number, number][] = [];

            trafficData.road_traffic_stts.forEach((road) => {
                // 시작점 추가
                const startCoords = road.start_nd_xy.split("_").map(Number);
                allEndpoints.push([startCoords[0], startCoords[1]]);

                // 끝점 추가
                const endCoords = road.end_nd_xy.split("_").map(Number);
                allEndpoints.push([endCoords[0], endCoords[1]]);
            });

            // 모든 종점의 평균 위치 계산
            if (allEndpoints.length > 0) {
                const sumLng = allEndpoints.reduce(
                    (sum, coord) => sum + coord[0],
                    0
                );
                const sumLat = allEndpoints.reduce(
                    (sum, coord) => sum + coord[1],
                    0
                );

                centerLng = sumLng / allEndpoints.length;
                centerLat = sumLat / allEndpoints.length;
            }
        }
        // 주차장 데이터가 있고 교통 데이터가 없으면 모든 주차장의 중심점으로 이동
        else if (parkData && parkData.prk_stts.length > 0) {
            const validParkingSpots = parkData.prk_stts.filter(
                (park) => park.lon && park.lat
            );

            if (validParkingSpots.length > 0) {
                const sumLng = validParkingSpots.reduce(
                    (sum, park) => sum + park.lon,
                    0
                );
                const sumLat = validParkingSpots.reduce(
                    (sum, park) => sum + park.lat,
                    0
                );

                centerLng = sumLng / validParkingSpots.length;
                centerLat = sumLat / validParkingSpots.length;
            }
        }
        // 데이터가 없으면 기본 위치로 이동
        else {
            const coords = toLngLatArray(initialCenter);
            centerLng = coords[0];
            centerLat = coords[1];
            zoomLevel = initialZoom;
        }

        // 계산된 중심점이 유효한지 확인
        if (!centerLng || !centerLat) {
            const coords = toLngLatArray(initialCenter);
            centerLng = coords[0];
            centerLat = coords[1];
        }

        // 이동 시작 상태 표시
        setFlyCompleted(false);

        // Fly to the center of the selected area
        map.current.flyTo({
            center: [centerLng, centerLat],
            zoom: zoomLevel,
            essential: true,
        });

        // 현재 좌표를 업데이트 (moveend 이벤트에서도 업데이트되지만 미리 설정)
        setCurrentCenter([centerLng, centerLat]);
        setCurrentZoom(zoomLevel);
    };

    // 모든 레이어 및 마커 제거
    const clearAllLayers = () => {
        if (!map.current || !mapLoaded) return;

        try {
            // Remove existing markers
            markerRefs.current.forEach((marker) => marker.remove());
            markerRefs.current = [];

            parkingMarkerRefs.current.forEach((marker) => marker.remove());
            parkingMarkerRefs.current = [];

            // Safe way to remove layers and sources without relying on getStyle()
            const safeRemoveLayers = () => {
                // Store a reference to avoid null issues in closure
                const mapRef = map.current;
                // Guard against map being null
                if (!mapRef) return;

                const removeLayers = () => {
                    if (mapRef.isStyleLoaded()) {
                        // Get all layers
                        const style = mapRef.getStyle();
                        const existingLayers = style.layers || [];

                        // Remove traffic layers
                        existingLayers.forEach((layer) => {
                            if (layer.id.startsWith("traffic-layer-")) {
                                if (mapRef.getLayer(layer.id)) {
                                    mapRef.removeLayer(layer.id);
                                }
                            }
                        });

                        // Remove traffic sources
                        const sources = Object.keys(style.sources || {});
                        sources.forEach((source) => {
                            if (source.startsWith("traffic-source-")) {
                                if (mapRef.getSource(source)) {
                                    mapRef.removeSource(source);
                                }
                            }
                        });
                    } else {
                        console.log(
                            "스타일이 로드되지 않았습니다. 레이어 제거를 위해 이벤트를 기다립니다."
                        );
                        mapRef.once("styledata", removeLayers);
                    }
                };

                removeLayers();
            };

            safeRemoveLayers();
        } catch (error) {
            console.error("Error clearing layers:", error);
        }
    };

    // 특정 지역의 도로 그리기 - 맵 인스턴스를 매개변수로 받음
    const drawRoadsForArea = (
        mapInstance: mapboxgl.Map,
        trafficData: TrafficData
    ) => {
        // 스타일 로드 확인 및 처리
        const drawWhenReady = () => {
            if (mapInstance.isStyleLoaded()) {
                trafficData.road_traffic_stts.forEach((road, index) => {
                    // xylist를 파싱하여 경로 좌표 배열 생성
                    let pathCoordinates: [number, number][] = [];

                    // xylist가 있으면 해당 좌표 사용
                    if (road.xylist) {
                        pathCoordinates = road.xylist
                            .split("|")
                            .map((point) => {
                                const coords = point.split("_").map(Number);
                                return [coords[0], coords[1]] as [
                                    number,
                                    number,
                                ];
                            });
                    }
                    // xylist가 없으면 시작점과 끝점만 사용
                    else {
                        const startCoords = road.start_nd_xy
                            .split("_")
                            .map(Number);
                        const endCoords = road.end_nd_xy.split("_").map(Number);
                        pathCoordinates = [
                            [startCoords[0], startCoords[1]],
                            [endCoords[0], endCoords[1]],
                        ];
                    }

                    // 소스 ID 생성
                    const sourceId = `traffic-source-${road.link_id}-${index}`;
                    const layerId = `traffic-layer-${road.link_id}-${index}`;

                    try {
                        // 이미 존재하는 소스 확인 후 제거
                        if (mapInstance.getSource(sourceId)) {
                            if (mapInstance.getLayer(layerId)) {
                                mapInstance.removeLayer(layerId);
                            }
                            mapInstance.removeSource(sourceId);
                        }

                        // 소스 추가
                        mapInstance.addSource(sourceId, {
                            type: "geojson",
                            data: {
                                type: "Feature",
                                properties: {
                                    name: road.road_nm,
                                    speed: road.spd,
                                    status: road.idx,
                                },
                                geometry: {
                                    type: "LineString",
                                    coordinates: pathCoordinates,
                                },
                            },
                        });

                        // 레이어 추가
                        mapInstance.addLayer({
                            id: layerId,
                            type: "line",
                            source: sourceId,
                            layout: {
                                "line-join": "round",
                                "line-cap": "round",
                            },
                            paint: {
                                "line-color": getTrafficColor(road.idx),
                                "line-width": 4,
                                "line-opacity": 0.8,
                            },
                        });
                    } catch (error) {
                        console.error(
                            `Error adding source or layer for road ${road.link_id}:`,
                            error
                        );
                    }
                });
            } else {
                // 스타일이 아직 로드되지 않았으면 styledata 이벤트를 기다림
                console.log(
                    "스타일이 로드되지 않았습니다. 이벤트를 기다립니다."
                );
                mapInstance.once("styledata", drawWhenReady);
            }
        };

        drawWhenReady();
    };

    // 주차장 마커 그리기 - 맵 인스턴스를 매개변수로 받음
    const drawParkingMarkersForArea = (
        mapInstance: mapboxgl.Map,
        parkingList: ParkNode[]
    ) => {
        // 스타일 로드 확인 및 처리
        const drawWhenReady = () => {
            if (mapInstance.isStyleLoaded()) {
                parkingList.forEach((park) => {
                    if (!park.lat || !park.lon) return;

                    const marker = createParkingMarker(mapInstance, park);
                    if (marker) {
                        parkingMarkerRefs.current.push(marker);
                    }
                });
            } else {
                // 스타일이 아직 로드되지 않았으면 styledata 이벤트를 기다림
                console.log(
                    "스타일이 로드되지 않았습니다. 주차장 마커를 위해 이벤트를 기다립니다."
                );
                mapInstance.once("styledata", drawWhenReady);
            }
        };

        drawWhenReady();
    };

    // 주차장 마커 생성 함수 - 맵 인스턴스를 매개변수로 받음
    const createParkingMarker = (
        mapInstance: mapboxgl.Map,
        park: ParkNode
    ): mapboxgl.Marker | null => {
        if (!mapInstance) return null;

        // Create popup content
        const popupContent = `
            <div class="parking-popup">
                <h3 class="font-bold text-md text-black">${park.prk_nm}</h3>
                <p class="text-sm text-black">주소: ${park.address || park.road_addr || "정보 없음"}</p>
                <p class="text-sm text-black">
                    <span class="font-semibold text-black">남은자리:</span>
                    ${park.cur_prk_cnt !== undefined ? `${park.cur_prk_cnt}/${park.cpcty || "?"}대` : "정보 없음"}
                </p>
                <p class="text-sm text-black">
                    <span class="font-semibold text-black">요금:</span>
                    ${park.pay_yn === "Y" ? "유료" : park.pay_yn === "N" ? "무료" : "정보 없음"}
                    ${park.rates !== undefined ? ` (기본 ${park.rates}원/${park.time_rates || "?"}분)` : ""}
                </p>
                <p class="text-sm text-black">
                    <span class="font-semibold text-black">추가요금:</span>
                    ${park.add_rates !== undefined ? ` ${park.add_rates}원/${park.add_time_rates || "?"}분` : ""}
                </p>

                <p class="text-sm text-gray-500 text-black">업데이트: ${park.cur_prk_time || "정보 없음"}</p>
            </div>
        `;

        // 주차 가능 비율 계산
        let availabilityRatio = 1;
        if (
            park.cur_prk_cnt !== undefined &&
            park.cpcty !== undefined &&
            park.cpcty > 0
        ) {
            availabilityRatio = park.cur_prk_cnt / park.cpcty;
        }

        // 색상 결정 - 용량에 따라 색상 변경 (녹색: 여유, 노란색: 중간, 빨간색: 혼잡)
        let color = "#4CAF50"; // 기본 녹색
        if (availabilityRatio < 0.2) {
            color = "#F44336"; // 빨간색 (20% 미만 남음)
        } else if (availabilityRatio < 0.5) {
            color = "#FFC107"; // 노란색 (50% 미만 남음)
        }

        // Create a popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

        // Create a DOM element for the marker
        const el = document.createElement("div");
        el.className = "parking-marker";
        el.style.width = "20px";
        el.style.height = "20px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = color;
        el.style.border = "2px solid white";
        el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";

        // Add a P inside the marker to indicate it's a parking
        const text = document.createElement("div");
        text.textContent = "P";
        text.style.color = "white";
        text.style.fontWeight = "bold";
        text.style.fontSize = "12px";
        text.style.display = "flex";
        text.style.alignItems = "center";
        text.style.justifyContent = "center";
        text.style.width = "100%";
        text.style.height = "100%";
        el.appendChild(text);

        // Add the marker to the map
        const marker = new mapboxgl.Marker(el)
            .setLngLat([park.lon, park.lat])
            .setPopup(popup)
            .addTo(mapInstance);

        return marker;
    };

    // When trafficData or parkData changes, update the map
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        // Clear all layers first
        clearAllLayers();

        // Wait for a short delay to ensure layers are cleared
        setTimeout(() => {
            // Check if map.current is still valid inside the timeout
            if (!map.current) return;

            if (trafficData) {
                drawRoadsForArea(map.current, trafficData);
            }

            if (parkData && parkData.prk_stts) {
                drawParkingMarkersForArea(map.current, parkData.prk_stts);
            }
        }, 100);
    }, [trafficData, parkData, mapLoaded]);

    // Helper function to determine line color based on traffic status
    const getTrafficColor = (status: string): string => {
        switch (status) {
            case "서행":
                return "#FFA500"; // Orange
            case "정체":
                return "#FF0000"; // Red
            case "원활":
                return "#00FF00"; // Green
            default:
                return "#FFFF00"; // Yellow
        }
    };

    // Return JSX
    return (
        <div style={{ height, width, position: "relative" }}>
            <div
                ref={mapContainer}
                style={{ position: "absolute", inset: 0 }}
            />

            {/* Legend - Only show when map is loaded */}
            {mapLoaded && (
                <div className="absolute bottom-4 right-4 bg-white p-2 md:p-3 rounded-lg shadow-md z-10 text-black text-xs md:text-sm">
                    <h3 className="font-bold mb-1 md:mb-2 text-center">범례</h3>
                    <div className="flex flex-row">
                        {/* Left column - Traffic status */}
                        <div className="mr-3 md:mr-4">
                            <h4 className="font-semibold mb-1">교통 상태:</h4>
                            <div className="flex items-center mb-1">
                                <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 mr-1 md:mr-2"></div>
                                <span>원활</span>
                            </div>
                            <div className="flex items-center mb-1">
                                <div className="w-3 h-3 md:w-4 md:h-4 bg-orange-500 mr-1 md:mr-2"></div>
                                <span>서행</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 md:w-4 md:h-4 bg-red-500 mr-1 md:mr-2"></div>
                                <span>정체</span>
                            </div>
                        </div>

                        {/* Right column - Parking status */}
                        <div className="ml-1 md:ml-2 border-l border-gray-300 pl-3 md:pl-4">
                            <h4 className="font-semibold mb-1">주차장 상태:</h4>
                            <div className="flex items-center mb-1">
                                <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 mr-1 md:mr-2 flex items-center justify-center text-white font-bold text-xxs md:text-xs">
                                    P
                                </div>
                                <span>여유</span>
                            </div>
                            <div className="flex items-center mb-1">
                                <div className="w-3 h-3 md:w-4 md:h-4 bg-yellow-500 mr-1 md:mr-2 flex items-center justify-center text-white font-bold text-xxs md:text-xs">
                                    P
                                </div>
                                <span>보통</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 md:w-4 md:h-4 bg-red-500 mr-1 md:mr-2 flex items-center justify-center text-white font-bold text-xxs md:text-xs">
                                    P
                                </div>
                                <span>혼잡</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrafficMap;
