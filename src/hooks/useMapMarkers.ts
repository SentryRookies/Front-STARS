import { useRef } from "react";
import mapboxgl from "mapbox-gl";
import { SearchResult } from "../api/searchApi";
import { renderPopupHTML, bindPopupEvents } from "../utils/popupUtils";

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
    isLogin,
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

    // 하이라이트된 POI 마커 생성 및 팝업 표시
    const showHighlightPOI = (
        highlightPOI: SearchResult | null,
        setHighlightPOI: (v: any) => void
    ) => {
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
        const isFavorite = isItemFavorite(
            highlightPOI.type,
            highlightPOI.id ?? highlightPOI.place_id
        );
        const popup = new mapboxgl.Popup({
            offset: 10,
            closeButton: false,
            maxWidth: "1000px",
        }).setHTML(renderPopupHTML(highlightPOI, isFavorite));
        const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([highlightPOI.lon, highlightPOI.lat])
            .setPopup(popup)
            .addTo(map);
        searchMarkersRef.current.push({ marker, item: highlightPOI });
        map.flyTo({
            center: [highlightPOI.lon, highlightPOI.lat],
            zoom: 17,
            pitch: 45,
            duration: 800,
        });
        popup.addTo(map);
        bindPopupEvents({
            popup,
            item: highlightPOI,
            isLogin,
            isItemFavorite,
            setAlertMessage,
            setAlertType,
            setAlertOpen,
            setToggledFavorites,
            getItemKey,
            setSelectedAreaId,
            setShowFocusCard,
        });
        setHighlightPOI(null);
    };

    // 검색 결과 마커 생성 및 팝업 표시
    const showSearchResults = (items: SearchResult[]) => {
        const map = mapRef.current;
        if (!map) return;
        searchMarkersRef.current.forEach(({ marker }) => marker.remove());
        searchMarkersRef.current = [];
        items.forEach((item) => {
            const el = document.createElement("div");
            el.className = "custom-marker";
            const isFavorite = isItemFavorite(
                item.type,
                item.id ?? item.place_id
            );
            const popup = new mapboxgl.Popup({
                offset: 10,
                closeButton: false,
                maxWidth: "1000px",
            }).setHTML(renderPopupHTML(item, isFavorite));
            popup.on("open", () => {
                bindPopupEvents({
                    popup,
                    item,
                    isLogin,
                    isItemFavorite,
                    setAlertMessage,
                    setAlertType,
                    setAlertOpen,
                    setToggledFavorites,
                    getItemKey,
                    setSelectedAreaId,
                    setShowFocusCard,
                });
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
    };

    // 단일 검색 결과 클릭 시 팝업 토글
    const toggleSingleResultPopup = (item: SearchResult) => {
        const map = mapRef.current;
        if (!map || isAnimatingRef.current) return;
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
            setTimeout(() => {
                if (isAnimatingRef.current) {
                    map.off("moveend", onMoveEnd);
                    isAnimatingRef.current = false;
                    found.marker.togglePopup();
                }
            }, 1000);
        }
    };

    return {
        showHighlightPOI,
        showSearchResults,
        toggleSingleResultPopup,
        searchMarkersRef,
    };
}
