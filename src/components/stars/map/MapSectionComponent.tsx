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
import {
    getUserFavoriteList,
    addFavorite,
    deleteFavorite,
} from "../../../api/mypageApi";
import { Favorite } from "../../../data/adminData";
import { AccidentAlertModal } from "../../alert/AccidentModal";
import PlaceSuggestion from "./PlaceSuggestion";

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
        setTriggerCountUp, // triggerCountUp 미사용이므로 제거
        accidentData, // 사고정보
    } = usePlace();
    const [showFocusCard, setShowFocusCard] = useState(false);
    const { alerts, dismissAlert } = useCongestionAlert();
    const { isLogin } = useCustomLogin();
    const [favoriteList, setFavoriteList] = useState<Favorite[]>([]);

    // 즐겨찾기 토글 상태: UI에 즉시 반영
    const [toggledFavorites, setToggledFavorites] = useState<
        Record<string, boolean>
    >({});
    const isAnimatingRef = useRef(false);
    // 아이템별 고유 키 생성 헬퍼
    const getItemKey = (type: string, place_id: string | number) =>
        `${type}:${String(place_id)}`;

    useEffect(() => {
        if (!isLogin) {
            setToggledFavorites({});
            setFavoriteList([]);
            return;
        }
        getUserFavoriteList().then(setFavoriteList);
    }, [isLogin]);

    // 즐겨찾기 여부 확인: toggledFavorites 우선, 없으면 favoriteList 검사
    const isItemFavorite = useCallback(
        (type: string, place_id: string | number) => {
            const key = getItemKey(type, place_id);
            if (key in toggledFavorites) {
                return toggledFavorites[key];
            }
            return favoriteList.some(
                (f) =>
                    f.type === type && String(f.place_id) === String(place_id)
            );
        },
        [toggledFavorites, favoriteList]
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

    // 팝업 HTML 생성 함수
    function renderPopupHTML(item: SearchResult) {
        // id 필드와 place_id 필드 모두 지원
        const placeId: string | number = item.id ?? item.place_id;
        const isFavorite = isItemFavorite(item.type, placeId);
        const badge = categoryBadge[item.type] ?? "bg-gray-100 text-gray-700";
        const label = categoryMap[item.type] ?? item.type;
        const starBtnHtml = `
            <button class="favorite-btn bg-white rounded-full shadow-md p-2" data-type="${item.type}" data-place-id="${placeId}">
                ${
                    isFavorite
                        ? `<svg class="w-4 h-4 text-yellow-300" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 20">
                               <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                           </svg>`
                        : `<svg class="w-4 h-4 text-gray-300" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 20">
                               <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                           </svg>`
                }
            </button>
        `;
        const phoneHtml = item.phone
            ? `<div class="text-sm text-gray-500">
                <span style="display:inline-flex;align-items:center;gap:4px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="color:#6b7280;">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.09 4.18 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.72c.13.81.37 1.6.7 2.34a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.74.33 1.53.57 2.34.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <a href="tel:${item.phone.replace(/[^0-9]/g, "")}" class="text-gray-700 hover:text-blue-600 hover:underline" style="word-break:break-all;">${item.phone}</a>
                </span>
            </div>`
            : "";
        const kakaoHtml = item.kakaomap_url
            ? `<a
                href="${item.kakaomap_url}"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="카카오맵에서 보기"
                style="display: inline-block;"
            >
                <img
                    src="/kakaoMap.png"
                    alt="카카오맵에서 보기"
                    style="width:36px; height: auto; display: inline-block;"
                />
            </a>`
            : "";

        const naverHtml = item.name
            ? `<a
                href="https://map.naver.com/p/search/${encodeURIComponent(item.name)}"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="네이버지도에서 보기"
                style="display: inline-block; margin-left: 8px;"
            >
                <img
                    src="/naverMap.png"
                    alt="네이버지도"
                    style="width:36px; height: auto; display:inline-block;"
                />
            </a>`
            : "";
        return `
            <div class="flex flex-col p-2 gap-1">
                <div class="flex items-center gap-2">
                    <h3 class="font-bold text-xl text-gray-700">${item.name}</h3>
                    <span class="inline-flex w-auto px-2 py-1 rounded-full text-xs font-semibold ${badge}">${label}</span>
                    ${starBtnHtml}
                </div>
                <p class="text-gray-700">${item.address}</p>
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${kakaoHtml}
                    ${naverHtml}
                </div>
                ${phoneHtml}
                <div class="flex justify-center">
                    <button class="mt-2 px-3 py-1 max-w-[180px] w-full bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 transition detail-btn" data-area-id="${item.area_id ?? ""}">
                        가까운 지역구 보기
                    </button>
                </div>            
            </div>
        `;
    }

    // 팝업 이벤트 재바인딩 함수
    function bindPopupEvents(popup: mapboxgl.Popup, item: SearchResult) {
        const popupEl = popup.getElement();
        if (!popupEl) return;

        const favBtn = popupEl.querySelector(".favorite-btn");
        if (!favBtn) return;

        // 팝업 열릴 때 초기 로컬 토글 상태 설정
        let isToggled = isItemFavorite(item.type, item.place_id);

        // 버튼 아이콘 및 클래스 즉시 변경 함수
        const updateButtonUI = (toggled: boolean) => {
            const svg = favBtn.querySelector("svg");
            if (!svg) return;

            if (toggled) {
                svg.classList.add("text-yellow-300");
                svg.classList.remove("text-gray-300");
            } else {
                svg.classList.add("text-gray-300");
                svg.classList.remove("text-yellow-300");
            }
        };

        // 초기 UI 반영
        updateButtonUI(isToggled);

        favBtn.addEventListener("click", async (e) => {
            e.stopPropagation();

            if (!isLogin) {
                alert("즐겨찾기 기능은 로그인 후 이용 가능합니다.");
                return;
            }

            // 로컬 상태 즉시 토글 및 UI 갱신
            isToggled = !isToggled;
            updateButtonUI(isToggled);

            try {
                if (isToggled) {
                    await addFavorite({
                        type: item.type,
                        place_id: item.place_id,
                    });
                } else {
                    await deleteFavorite({
                        type: item.type,
                        place_id: item.place_id,
                    });
                }

                // 토글 상태 전역 상태도 업데이트
                const key = getItemKey(item.type, item.place_id);
                setToggledFavorites((prev) => ({
                    ...prev,
                    [key]: isToggled,
                }));
            } catch (error) {
                console.error("즐겨찾기 변경 실패", error);

                // 실패 시 롤백: UI 원상복구
                isToggled = !isToggled;
                updateButtonUI(isToggled);
            }
        });
        const detailBtn = popupEl.querySelector(".detail-btn");
        if (detailBtn) {
            detailBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const areaId = item.area_id;
                if (areaId) {
                    setSelectedAreaId(areaId);
                    setShowFocusCard(true);
                }
            });
        }
    }

    const handleSearchResultClick = useCallback(
        (items: SearchResult[]) => {
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
                    maxWidth: "1000px",
                }).setHTML(renderPopupHTML(item));
                popup.on("open", () => {
                    bindPopupEvents(popup, item);
                });
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
                    duration: 500,
                    easing: (t) => t * (2 - t),
                });
                setShowFocusCard(false);
            }
        },
        [isItemFavorite, setSelectedAreaId]
    );

    // const handleSingleResultClick = useCallback((item: SearchResult) => {
    //     const map = mapRef.current;
    //     if (!map) return;
    //     searchMarkersRef.current.forEach(({ marker }) =>
    //         marker.getPopup()?.remove()
    //     );
    //     const found = searchMarkersRef.current.find(
    //         (m) => m.item.name === item.name && m.item.address === item.address
    //     );
    //     if (found) {
    //         map.jumpTo({
    //             center: [item.lon, item.lat],
    //             zoom: 17,
    //             pitch: 45,
    //         });
    //         found.marker.togglePopup();
    //     }
    // }, []);

    const handleSingleResultClick = useCallback((item: SearchResult) => {
        const map = mapRef.current;
        if (!map || isAnimatingRef.current) return;

        // 좌표값 검증
        if (!item.lon || !item.lat || isNaN(item.lon) || isNaN(item.lat)) {
            console.warn("Invalid coordinates:", item);
            return;
        }

        searchMarkersRef.current.forEach(({ marker }) =>
            marker.getPopup()?.remove()
        );

        const found = searchMarkersRef.current.find(
            (m) => m.item.name === item.name && m.item.address === item.address
        );

        if (found) {
            isAnimatingRef.current = true;
            map.stop();

            const onMoveEnd = () => {
                map.off("moveend", onMoveEnd);
                isAnimatingRef.current = false;
                found.marker.togglePopup();
            };

            map.on("moveend", onMoveEnd);

            map.flyTo({
                center: [item.lon, item.lat],
                zoom: 17,
                pitch: 45,
                essential: true,
            });

            // 타임아웃으로 안전장치 추가
            setTimeout(() => {
                if (isAnimatingRef.current) {
                    map.off("moveend", onMoveEnd);
                    isAnimatingRef.current = false;
                    found.marker.togglePopup();
                }
            }, 1000); // 1초 후 강제 완료
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
                keyword={searchKeyword ?? undefined}
                onKeywordSearched={onSearchComplete}
                onResultClick={handleSearchResultClick}
                onSingleResultClick={handleSingleResultClick}
            />

            <PlaceSuggestion />

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
            <AccidentAlertModal
                accidents={accidentData}
                onViewArea={handleViewArea}
            />

            <AlertModal
                alerts={alerts}
                onDismiss={dismissAlert}
                onViewArea={handleViewArea}
            />
        </div>
    );
}
