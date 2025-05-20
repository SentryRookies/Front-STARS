import React, { useEffect, useRef, useState } from "react";
import AdminHeader from "./AdminHeader";
import mapboxgl, { LngLatLike, NavigationControl } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAdminData } from "../../context/AdminContext";
import { MapData, ParkNode, TrafficData } from "../../data/adminData";
import MapboxLanguage from "@mapbox/mapbox-gl-language";

const AdminTraffic = () => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const markerRefs = useRef<mapboxgl.Marker[]>([]);
    const parkingMarkerRefs = useRef<mapboxgl.Marker[]>([]);
    const initialMapCenter: LngLatLike = [126.978, 37.5665]; // Seoul
    const initialMapZoom = 11;

    // 지역 검색을 위한 상태 추가
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredMapData, setFilteredMapData] = useState<MapData[]>([]);

    // 범례 표시 상태 추가
    const [showLegend, setShowLegend] = useState<boolean>(true);

    const { mapData } = useAdminData();

    // 검색어에 따라 필터링된 지역 데이터 업데이트
    useEffect(() => {
        if (!mapData || mapData.length === 0) {
            setFilteredMapData([]);
            return;
        }

        if (!searchTerm.trim()) {
            // 검색어가 없으면 모든 데이터 표시
            setFilteredMapData(mapData);
        } else {
            // 검색어를 포함하는 지역만 필터링
            const filtered = mapData.filter((area) =>
                area.area_nm.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredMapData(filtered);
        }
    }, [searchTerm, mapData]);

    // 지도 초기화
    useEffect(() => {
        console.log("교통 주차 통합 데이터: ", mapData);
        if (!mapContainer.current) return;

        // mapbox token 설정
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

        // 지도 초기화
        const mapInstance = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/light-v11",
            center: initialMapCenter,
            zoom: initialMapZoom,
            interactive: true,
        });

        mapInstance.addControl(
            new NavigationControl({
                visualizePitch: true,
            }),
            "right"
        );

        mapInstance.addControl(
            new MapboxLanguage({
                defaultLanguage: "ko",
            })
        );

        // 지도 로드 완료 이벤트
        mapInstance.on("load", () => {
            console.log("Map loaded");
            setMapLoaded(true);
        });

        map.current = mapInstance;

        // Clean up on unmount
        return () => {
            if (map.current) map.current.remove();
            // 마커 제거
            markerRefs.current.forEach((marker) => marker.remove());
            markerRefs.current = [];
            parkingMarkerRefs.current.forEach((marker) => marker.remove());
            parkingMarkerRefs.current = [];
        };
    }, []);

    // 초기 지도 화면으로 리셋하는 함수
    const resetMapView = () => {
        if (!map.current) return;

        // 선택된 지역 상태 초기화
        setSelectedArea(null);

        // 검색어 초기화
        setSearchTerm("");

        // 모든 레이어 및 마커 제거
        clearAllLayers();

        // 초기 위치 및 확대 수준으로 이동
        map.current.flyTo({
            center: initialMapCenter as [number, number],
            zoom: initialMapZoom,
            essential: true,
        });
    };

    // 선택된 지역으로 이동하는 함수
    const moveToSelectedArea = (areaData: MapData) => {
        if (!map.current) return;

        const trafficData = areaData.trafficData;
        const parkData = areaData.parkData;

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
            centerLng = initialMapCenter[0];
            centerLat = initialMapCenter[1];
            zoomLevel = initialMapZoom;
        }

        // 계산된 중심점이 유효한지 확인
        if (!centerLng || !centerLat) {
            centerLng = initialMapCenter[0];
            centerLat = initialMapCenter[1];
        }

        // Fly to the center of the selected area
        map.current.flyTo({
            center: [centerLng, centerLat],
            zoom: zoomLevel,
            essential: true,
        });

        // 선택된 지역의 도로 및 주차장 표시
        highlightAreaData(areaData);
    };

    // 특정 지역의 도로와 주차장 하이라이트
    const highlightAreaData = (areaData: MapData) => {
        if (!map.current || !mapLoaded) return;

        // Clear all existing layers and sources
        clearAllLayers();

        // 교통 데이터가 있으면 도로 그리기
        if (areaData.trafficData) {
            drawRoadsForArea(areaData.trafficData);
        }

        // 주차장 데이터가 있으면 주차장 마커 그리기
        if (areaData.parkData) {
            drawParkingMarkersForArea(areaData.parkData.prk_stts);
        }
    };

    // 모든 레이어 및 마커 제거
    const clearAllLayers = () => {
        if (!map.current) return;

        // 교통 레이어 제거
        clearAllTrafficLayers();

        // 주차장 마커 제거
        parkingMarkerRefs.current.forEach((marker) => marker.remove());
        parkingMarkerRefs.current = [];
    };

    // 모든 트래픽 레이어 제거
    const clearAllTrafficLayers = () => {
        if (!map.current) return;

        // Get all layers
        const existingLayers = map.current.getStyle().layers || [];

        // Remove traffic layers
        existingLayers.forEach((layer) => {
            if (layer.id.startsWith("traffic-layer-")) {
                if (map.current?.getLayer(layer.id)) {
                    map.current?.removeLayer(layer.id);
                }
            }
        });

        // Remove traffic sources
        const sources = Object.keys(map.current.getStyle().sources || {});
        sources.forEach((source) => {
            if (source.startsWith("traffic-source-")) {
                if (map.current?.getSource(source)) {
                    map.current?.removeSource(source);
                }
            }
        });

        // Remove existing markers
        markerRefs.current.forEach((marker) => marker.remove());
        markerRefs.current = [];
    };

    // 특정 지역의 도로 그리기
    const drawRoadsForArea = (trafficData: TrafficData) => {
        if (!map.current || !mapLoaded) {
            console.log("Map not ready yet");
            return;
        }

        trafficData.road_traffic_stts.forEach((road, index) => {
            // xylist를 파싱하여 경로 좌표 배열 생성
            let pathCoordinates: [number, number][] = [];

            // xylist가 있으면 해당 좌표 사용
            if (road.xylist) {
                pathCoordinates = road.xylist.split("|").map((point) => {
                    const coords = point.split("_").map(Number);
                    return [coords[0], coords[1]] as [number, number];
                });
            }
            // xylist가 없으면 시작점과 끝점만 사용
            else {
                const startCoords = road.start_nd_xy.split("_").map(Number);
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
                // 소스 추가
                map.current!.addSource(sourceId, {
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
                map.current!.addLayer({
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
                console.error("Error adding source or layer:", error);
            }
        });
    };

    // 주차장 마커 그리기
    const drawParkingMarkersForArea = (parkingList: ParkNode[]) => {
        if (!map.current || !mapLoaded) {
            console.log("Map not ready yet");
            return;
        }

        parkingList.forEach((park) => {
            if (!park.lat || !park.lon) return;

            const marker = createParkingMarker(park);
            if (marker) {
                parkingMarkerRefs.current.push(marker);
            }
        });
    };

    // 주차장 마커 생성 함수
    const createParkingMarker = (park: ParkNode): mapboxgl.Marker | null => {
        if (!map.current) return null;

        console.log("park info: ", park);

        // Create popup content - Improved for mobile
        const popupContent = `
            <div class="parking-popup">
                <h3 class="font-bold text-sm md:text-md text-black">${park.prk_nm}</h3>
                <p class="text-xs md:text-sm text-black">주소: ${park.address || park.road_addr || "정보 없음"}</p>
                <p class="text-xs md:text-sm text-black">
                    <span class="font-semibold text-black">남은자리:</span> 
                    ${park.cur_prk_cnt !== undefined ? `${park.cur_prk_cnt}/${park.cpcty || "?"}대` : "정보 없음"}
                </p>
                <p class="text-xs md:text-sm text-black">
                    <span class="font-semibold text-black">요금:</span> 
                    ${park.pay_yn === "Y" ? "유료" : park.pay_yn === "N" ? "무료" : "정보 없음"}
                    ${park.rates !== undefined ? ` (기본 ${park.rates}원/${park.time_rates || "?"}분)` : ""}
                </p>
                <p class="text-xs md:text-sm text-black">
                    <span class="font-semibold text-black">추가요금:</span>
                    ${park.add_rates !== undefined ? ` ${park.add_rates}원/${park.add_time_rates || "?"}분` : ""}
                </p>
                
                <p class="text-xs text-gray-500 text-black">업데이트: ${park.cur_prk_time || "정보 없음"}</p>
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

        // Create a popup with responsive settings
        const popup = new mapboxgl.Popup({
            offset: 15,
            closeButton: false,
            maxWidth: "260px",
        }).setHTML(popupContent);

        // Create a DOM element for the marker - Adjusted for better mobile visibility
        const el = document.createElement("div");
        el.className = "parking-marker";
        el.style.width = "18px";
        el.style.height = "18px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = color;
        el.style.border = "2px solid white";
        el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.3)";

        // Add a P inside the marker to indicate it's a parking
        const text = document.createElement("div");
        text.textContent = "P";
        text.style.color = "white";
        text.style.fontWeight = "bold";
        text.style.fontSize = "10px";
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
            .addTo(map.current);

        return marker;
    };

    // 선택된 지역이 변경될 때 지도 이동 및 데이터 표시
    useEffect(() => {
        if (!mapLoaded) return;

        if (selectedArea && mapData.length) {
            const area = mapData.find((area) => area.area_nm === selectedArea);
            if (area) {
                moveToSelectedArea(area);
            }
        } else if (selectedArea === null) {
            // 선택된 지역이 null이 되면 모든 레이어 제거
            clearAllLayers();
        }
    }, [selectedArea, mapData, mapLoaded]);

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

    // 각 지역별 주차장 대수 계산
    const getParkingCount = (area: MapData | undefined): number => {
        if (!area || !area.parkData || !area.parkData.prk_stts) return 0;
        return area.parkData.prk_stts.length;
    };

    // 각 지역별 교통 상태 텍스트 반환
    const getTrafficStatusText = (area: MapData): string => {
        if (!area.trafficData) return "정보 없음";
        return `${area.trafficData.road_traffic_idx} (${area.trafficData.road_traffic_spd}km/h)`;
    };

    // 검색어 입력 핸들러
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // 검색어 초기화 핸들러
    const clearSearch = () => {
        setSearchTerm("");
    };

    // 범례 토글 핸들러
    const toggleLegend = () => {
        setShowLegend(!showLegend);
    };

    // Return statement with responsive JSX
    return (
        <div className="bg-gray-100 flex flex-col w-full h-screen">
            {/* Header */}
            <AdminHeader path={"/manage"} />
            {/* End of Header */}

            {/* Main content - Added vertical divider */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                {/* Left panel - Collapsible on mobile */}
                <div className="w-full md:w-1/4 bg-white border-b md:border-r md:border-r-gray-300 md:shadow-md flex flex-col text-black z-10 relative">
                    {/* Mobile divider - visible only on mobile at the bottom of card section */}
                    <div className="md:hidden absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-b from-gray-200 to-gray-300 shadow-md"></div>
                    {/* Fixed Header Section */}

                    <div className="p-2 md:p-4 border-b">
                        <div className="flex justify-between items-center mb-2 md:mb-3">
                            <h2 className="text-lg md:text-xl font-bold">
                                교통 & 주차 현황
                            </h2>

                            {/* 버튼 그룹 - 초기화와 전체 표시 버튼 */}
                            <div className="flex space-x-2">
                                {/* 초기화 버튼 */}
                                <button
                                    onClick={resetMapView}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm flex items-center shadow-md transition-colors duration-200"
                                    title="초기 화면으로 돌아가기"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3 w-3 md:h-4 md:w-4 mr-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                        />
                                    </svg>
                                    <span className="hidden sm:inline">
                                        초기 화면
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* 검색 입력 필드 추가 */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="지역명 검색..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full px-2 py-1 md:px-4 md:py-2 pr-8 md:pr-10 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black bg-gray-50 hover:bg-red-500 hover:text-white"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="h-48 md:h-auto md:flex-1 overflow-y-auto p-2 px-3 md:p-4 custom-scrollbar pb-6">
                        {filteredMapData.length > 0 ? (
                            filteredMapData.map((area, idx) => (
                                <div
                                    key={idx}
                                    className={`p-2 md:p-3 border rounded-lg mb-2 md:mb-3 cursor-pointer transition-all duration-200 ${
                                        selectedArea === area.area_nm
                                            ? "bg-blue-50 border-blue-300 shadow-md"
                                            : "hover:bg-gray-50"
                                    }`}
                                    onClick={() => {
                                        setSelectedArea(area.area_nm);
                                    }}
                                >
                                    <h3 className="font-bold text-sm md:text-base">
                                        {area.area_nm}
                                    </h3>
                                    <div className="flex flex-row justify-between items-center mt-1">
                                        <span className="text-xs md:text-sm">
                                            교통: {getTrafficStatusText(area)}
                                        </span>
                                        <span className="text-xs md:text-sm">
                                            주차: {getParkingCount(area)}개
                                        </span>
                                    </div>
                                    {area.trafficData && (
                                        <p className="text-sm text-gray-600 mt-1 hidden md:block">
                                            {area.trafficData.road_msg}
                                        </p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                {searchTerm
                                    ? "검색 결과가 없습니다."
                                    : "데이터가 없습니다."}
                            </div>
                        )}
                    </div>
                    {/* Scrollable Content Area - More compact on mobile */}
                </div>

                {/* Map - Full width on mobile, remaining space on desktop */}
                <div className="flex-1 relative h-full min-h-[400px] mt-3 md:mt-0">
                    {/* Strong mobile horizontal divider - only visible on mobile */}
                    <div className="md:hidden absolute top-0 left-0 right-0 h-1 bg-gray-400 shadow-md z-10"></div>
                    {/* Strong vertical divider that's only visible on desktop */}
                    <div className="hidden md:block absolute top-0 left-0 h-full w-1 bg-gray-300 shadow-md"></div>
                    <div ref={mapContainer} className="absolute inset-0" />

                    {/* Legend Toggle Button - Improved for mobile */}
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
                        <button
                            onClick={toggleLegend}
                            className="bg-white p-1.5 sm:p-2 rounded-lg shadow-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                            title={showLegend ? "범례 숨기기" : "범례 보기"}
                            aria-label={
                                showLegend ? "범례 숨기기" : "범례 보기"
                            }
                        >
                            {showLegend ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 sm:h-5 sm:w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 sm:h-5 sm:w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                            <span className="ml-1 text-xs sm:text-sm hidden sm:inline">
                                {showLegend ? "범례 숨기기" : "범례 보기"}
                            </span>
                        </button>
                    </div>

                    {/* Legend - Improved for mobile */}
                    {showLegend && (
                        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white p-1.5 sm:p-3 rounded-lg shadow-md z-10 text-black text-xs transition-all duration-300 max-w-[calc(100%-16px)] sm:max-w-none">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-bold text-center text-xs sm:text-sm">
                                    범례
                                </h3>
                                <button
                                    onClick={toggleLegend}
                                    className="text-gray-500 sm:hidden bg-white p-1 -mr-1 -mt-1 rounded-full hover:bg-gray-100"
                                    aria-label="범례 닫기"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3 w-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex flex-col xs:flex-row gap-2">
                                {/* Traffic status column - Compact for very small screens */}
                                <div className="mr-0 xs:mr-3">
                                    <h4 className="font-semibold mb-0.5 sm:mb-1 text-xs">
                                        교통 상태:
                                    </h4>
                                    <div className="flex items-center mb-0.5 sm:mb-1">
                                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-green-500 mr-1 sm:mr-1.5"></div>
                                        <span className="text-[0.625rem] sm:text-xs">
                                            원활
                                        </span>
                                    </div>
                                    <div className="flex items-center mb-0.5 sm:mb-1">
                                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-orange-500 mr-1 sm:mr-1.5"></div>
                                        <span className="text-[0.625rem] sm:text-xs">
                                            서행
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-red-500 mr-1 sm:mr-1.5"></div>
                                        <span className="text-[0.625rem] sm:text-xs">
                                            정체
                                        </span>
                                    </div>
                                </div>

                                {/* Divider line - visible only on larger mobile screens */}
                                <div className="hidden xs:block border-l border-gray-300 h-auto"></div>

                                {/* Parking status column */}
                                <div className="mt-1 xs:mt-0 xs:ml-1 pt-1 xs:pt-0 border-t xs:border-t-0 border-gray-200 xs:pl-2">
                                    <h4 className="font-semibold mb-0.5 sm:mb-1 text-xs">
                                        주차장 상태:
                                    </h4>
                                    <div className="flex items-center mb-0.5 sm:mb-1">
                                        <div className="flex-shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-green-500 mr-1 sm:mr-1.5 flex items-center justify-center text-white font-bold">
                                            <span className="text-[0.625rem] sm:text-xs">
                                                P
                                            </span>
                                        </div>
                                        <span className="text-[0.625rem] sm:text-xs">
                                            여유
                                        </span>
                                    </div>
                                    <div className="flex items-center mb-0.5 sm:mb-1">
                                        <div className="flex-shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-yellow-500 mr-1 sm:mr-1.5 flex items-center justify-center text-white font-bold">
                                            <span className="text-[0.625rem] sm:text-xs">
                                                P
                                            </span>
                                        </div>
                                        <span className="text-[0.625rem] sm:text-xs">
                                            보통
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-red-500 mr-1 sm:mr-1.5 flex items-center justify-center text-white font-bold">
                                            <span className="text-[0.625rem] sm:text-xs">
                                                P
                                            </span>
                                        </div>
                                        <span className="text-[0.625rem] sm:text-xs">
                                            혼잡
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminTraffic;
