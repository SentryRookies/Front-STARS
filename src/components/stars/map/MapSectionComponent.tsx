import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { usePlace } from "../../../context/PlaceContext";
import SearchBar from "../search/SearchBar";
import useCustomLogin from "../../../hooks/useCustomLogin";
import AlertModal from "../../alert/AlertModal";
import useCongestionAlert from "../../../hooks/useCongestionAlert";
import AreaFocusCard from "./AreaFocusCard";
import { SearchResult } from "../../../api/searchApi";
import { AccidentAlertModal } from "../../alert/AccidentModal";
import PlaceSuggestion from "../suggestion/PlaceSuggestion";
import FavoriteAlertModal from "../../alert/FavoriteAlertModal";
import { useMapMarkers } from "../../../hooks/useMapMarkers";
import { useMapboxInit } from "../../../hooks/useMapboxInit";
import { getAreaList } from "../../../api/starsApi";
import { useFavorites } from "../../../hooks/useFavorites";
import CustomPopupCard from "./CustomPopupCard";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

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

    // useFavorites 훅 사용
    const { setToggledFavorites, isItemFavorite, getItemKey } =
        useFavorites(isLogin);

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [AlertType, setAlertType] = useState<"success" | "remove">("success");

    // useMapMarkers 훅 사용 - 업데이트된 반환값들 포함
    const {
        showHighlightPOI,
        showSearchResults,
        toggleSingleResultPopup,
        popupItem,
        popupPosition,
        handlePopupClose,
        handleFavoriteToggle,
        handleDetailClick,
    } = useMapMarkers({
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
    });

    useEffect(() => {
        showHighlightPOI(highlightPOI, setHighlightPOI);
    }, [highlightPOI, showHighlightPOI, setHighlightPOI]);

    // 지도 초기화 및 클러스터/레이어 관리 훅 사용
    useMapboxInit({
        mapContainer,
        mapRef,
        setSelectedAreaId,
        setShowFocusCard,
    });

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
            showSearchResults(items);
        },
        [showSearchResults]
    );

    const handleSingleResultClick = useCallback(
        (item: SearchResult) => {
            toggleSingleResultPopup(item);
        },
        [toggleSingleResultPopup]
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

            <CustomPopupCard
                item={popupItem}
                position={popupPosition}
                onClose={handlePopupClose}
                onFavoriteToggle={handleFavoriteToggle}
                onDetailClick={handleDetailClick}
                isItemFavorite={isItemFavorite}
                isLogin={isLogin}
            />
        </div>
    );
}
