import React, { useRef } from "react";
import { SearchResult } from "../../../api/searchApi";
import useFavorites from "../../../hooks/useFavorites";
import useCustomLogin from "../../../hooks/useCustomLogin";
import { categoryMap, categoryBadge } from "./mapPopupUtils";

interface MapPopupProps {
    item: SearchResult;
    onAreaDetail?: (areaId: number) => void;
}

/**
 * Component for rendering popup content in MapSectionComponent
 */
const MapPopup: React.FC<MapPopupProps> = ({ item, onAreaDetail }) => {
    const { isItemFavorite, addToFavorites, removeFromFavorites } =
        useFavorites();
    const { isLogin } = useCustomLogin();
    const favBtnRef = useRef<HTMLButtonElement>(null);

    // id field and place_id field both supported
    const placeId: string | number = item.id ?? item.place_id;
    const isFavorite = isItemFavorite(item.type, placeId);
    const badge = categoryBadge[item.type] ?? "bg-gray-100 text-gray-700";
    const label = categoryMap[item.type] ?? item.type;
    const isEventType =
        item.type === "cultural_event" ||
        item.type === "culturalevent" ||
        item.type === "문화행사";

    // Handle favorite button click
    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!isLogin) {
            alert("즐겨찾기 기능은 로그인 후 이용 가능합니다.");
            return;
        }

        if (isFavorite) {
            await removeFromFavorites(item.type, placeId);
        } else {
            await addToFavorites(item.type, placeId);
        }
    };

    // Handle area detail button click
    const handleAreaDetailClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const areaId = item.area_id;
        if (areaId && onAreaDetail) {
            onAreaDetail(areaId);
        }
    };

    return (
        <div className="flex flex-col p-2 gap-2">
            <div className="flex items-center gap-2">
                <h3 className="font-bold text-xl text-gray-700">{item.name}</h3>
                <span
                    className={`inline-flex w-auto px-2 py-1 rounded-full text-xs font-semibold ${badge}`}
                >
                    {label}
                </span>
                {!isEventType && (
                    <button
                        ref={favBtnRef}
                        className="favorite-btn bg-white rounded-full shadow-md p-2"
                        onClick={handleFavoriteClick}
                    >
                        {isFavorite ? (
                            <svg
                                className="w-4 h-4 text-yellow-300"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 22 20"
                            >
                                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                            </svg>
                        ) : (
                            <svg
                                className="w-4 h-4 text-gray-300"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 22 20"
                            >
                                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                            </svg>
                        )}
                    </button>
                )}
            </div>

            <p className="text-gray-700">{item.address}</p>

            {item.phone && (
                <div className="text-sm text-gray-500">전화: {item.phone}</div>
            )}

            {item.kakaomap_url && (
                <button
                    className="mt-1 text-xs px-2 py-1 bg-[#FEE500] text-[#3C1E1E] font-bold rounded shadow hover:bg-yellow-300 transition"
                    onClick={() => window.open(item.kakaomap_url, "_blank")}
                >
                    카카오맵에서 보기
                </button>
            )}

            <button
                className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition"
                onClick={handleAreaDetailClick}
            >
                가까운 지역구 보기
            </button>
        </div>
    );
};

export default MapPopup;
