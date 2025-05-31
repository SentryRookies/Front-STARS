import { useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { SearchResult } from "../api/searchApi";
import { addFavorite, addFavorite2, deleteFavorite2 } from "../api/mypageApi";

interface UseMapMarkersParams {
    mapRef: React.MutableRefObject<mapboxgl.Map | null>;
    isLogin: boolean;
    isItemFavorite: (type: string, place_id: string | number) => boolean;
    setAlertMessage: (msg: string) => void;
    setAlertType: (type: "success" | "remove") => void;
    setAlertOpen: (open: boolean) => void;
    setToggledFavorites: (
        fn: (prev: Record<string, boolean>) => Record<string, boolean>
    ) => void;
    getItemKey: (type: string, place_id: string | number) => string;
    setSelectedAreaId: (areaId: number) => void;
    setShowFocusCard: (show: boolean) => void;
}

export function useMapMarkers({
    mapRef,
    isItemFavorite,
    setAlertMessage,
    setAlertType,
    setAlertOpen,
    setToggledFavorites,
    getItemKey,
    setSelectedAreaId,
    setShowFocusCard,
}: UseMapMarkersParams) {
    const searchMarkersRef = useRef<
        { marker: mapboxgl.Marker; item: SearchResult }[]
    >([]);
    const isAnimatingRef = useRef(false);

    // CustomPopupCard 상태 관리
    const [popupItem, setPopupItem] = useState<SearchResult | null>(null);
    const [popupPosition, setPopupPosition] = useState<{
        x: number;
        y: number;
    } | null>(null);

    // 마커 클릭시 CustomPopupCard 표시를 위한 헬퍼 함수
    const showCustomPopup = (item: SearchResult, marker: mapboxgl.Marker) => {
        const map = mapRef.current;
        if (!map) return;

        // 마커의 화면상 위치 계산
        const markerElement = marker.getElement();
        const rect = markerElement.getBoundingClientRect();
        const position = {
            x: rect.left + rect.width / 2,
            y: rect.top,
        };

        setPopupItem(item);
        setPopupPosition(position);
    };

    // 즐겨찾기 토글 핸들러
    const handleFavoriteToggle = async (item: SearchResult) => {
        const placeId = item.id ?? item.place_id;
        const itemKey = getItemKey(item.type, placeId);
        const currentFavoriteStatus = isItemFavorite(item.type, placeId);

        // UI 상태 즉시 업데이트 (낙관적 업데이트)
        setToggledFavorites((prev) => ({
            ...prev,
            [itemKey]: !currentFavoriteStatus,
        }));

        try {
            // 서버 요청을 await로 대기
            if (!currentFavoriteStatus) {
                await addFavorite2(item.type, item.place_id);
            } else {
                await deleteFavorite2(item.type, item.place_id);
            }

            // 성공 메시지
            setAlertMessage(
                !currentFavoriteStatus
                    ? "즐겨찾기에 추가되었습니다"
                    : "즐겨찾기에서 제거되었습니다"
            );
            setAlertType(!currentFavoriteStatus ? "success" : "remove");
            setAlertOpen(true);
        } catch (error) {
            console.error("즐겨찾기 토글 실패:", error);

            // 실패시 이전 상태로 롤백
            setToggledFavorites((prev) => ({
                ...prev,
                [itemKey]: currentFavoriteStatus,
            }));

            // 에러 메시지
            setAlertMessage("즐겨찾기 처리 중 오류가 발생했습니다");
            setAlertType("remove");
            setAlertOpen(true);
        }
    };

    // 상세보기 클릭 핸들러
    const handleDetailClick = (areaId: number) => {
        setSelectedAreaId(areaId);
        setShowFocusCard(true);
    };

    // 팝업 닫기 핸들러
    const handlePopupClose = () => {
        setPopupItem(null);
        setPopupPosition(null);
    };

    // 하이라이트된 POI 마커 생성 및 CustomPopupCard 표시
    const showHighlightPOI = (
        highlightPOI: SearchResult | null,
        setHighlightPOI: (v: SearchResult | null) => void
    ) => {
        if (!highlightPOI || !mapRef.current) return;
        const map = mapRef.current;

        // 기존 마커들 제거
        searchMarkersRef.current.forEach(({ marker }) => marker.remove());
        searchMarkersRef.current = [];

        // 새 마커 생성
        const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.width = "20px";
        el.style.height = "20px";
        el.style.backgroundColor = "#7c3bf6";
        el.style.borderRadius = "50%";
        el.style.cursor = "pointer";
        el.style.border = "2px solid white";
        el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";

        const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([highlightPOI.lon, highlightPOI.lat])
            .addTo(map);

        // 마커 클릭 이벤트
        el.addEventListener("click", () => {
            showCustomPopup(highlightPOI, marker);
        });

        // 지도 이동
        map.flyTo({
            center: [highlightPOI.lon, highlightPOI.lat + 0.0005],
            zoom: 17,
            pitch: 45,
            duration: 800,
        });

        searchMarkersRef.current.push({ marker, item: highlightPOI });

        // 자동으로 팝업 표시

        setHighlightPOI(null);
    };

    // 검색 결과 마커 생성 및 CustomPopupCard 표시
    const showSearchResults = (items: SearchResult[]) => {
        const map = mapRef.current;
        if (!map) return;

        // 기존 마커들 제거
        searchMarkersRef.current.forEach(({ marker }) => marker.remove());
        searchMarkersRef.current = [];

        // 팝업 닫기
        handlePopupClose();

        items.forEach((item) => {
            const el = document.createElement("div");
            el.className = "custom-marker";
            el.style.width = "20px";
            el.style.height = "20px";
            el.style.backgroundColor = "#7c3bf6";
            el.style.borderRadius = "50%";
            el.style.cursor = "pointer";
            el.style.border = "2px solid white";
            el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";

            const marker = new mapboxgl.Marker({ element: el })
                .setLngLat([item.lon, item.lat])
                .addTo(map);

            // 마커 클릭 이벤트
            el.addEventListener("click", () => {
                if (!map) return;
                map.stop();
                map.once("moveend", () => {
                    showCustomPopup(item, marker);
                });
                map.flyTo({
                    center: [item.lon, item.lat + 0.0005],
                    zoom: 16,
                    pitch: 45,
                    duration: 500,
                    essential: true,
                });
            });

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
    };

    // 단일 검색 결과 클릭 시 CustomPopupCard 토글
    const toggleSingleResultPopup = (item: SearchResult) => {
        const map = mapRef.current;
        if (!map || isAnimatingRef.current) return;

        if (!item.lon || !item.lat || isNaN(item.lon) || isNaN(item.lat)) {
            console.warn("Invalid coordinates:", item);
            return;
        }

        // 기존 팝업 닫기
        handlePopupClose();

        const found = searchMarkersRef.current.find(
            (m) => m.item.name === item.name && m.item.address === item.address
        );

        if (found) {
            isAnimatingRef.current = true;
            map.stop();

            const onMoveEnd = () => {
                map.off("moveend", onMoveEnd);
                isAnimatingRef.current = false;
                showCustomPopup(item, found.marker);
            };

            map.on("moveend", onMoveEnd);
            map.flyTo({
                center: [item.lon, item.lat + 0.0005],
                zoom: 17,
                pitch: 45,
                essential: true,
            });

            // 타임아웃으로 안전장치
        }
    };

    return {
        showHighlightPOI,
        showSearchResults,
        toggleSingleResultPopup,
        searchMarkersRef,
        // CustomPopupCard용 상태와 핸들러들
        popupItem,
        popupPosition,
        handlePopupClose,
        handleFavoriteToggle,
        handleDetailClick,
    };
}
