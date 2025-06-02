// CustomPopupCard.tsx
import React, { useEffect, useRef, useState } from "react";
import { SearchResult } from "../../../api/searchApi";
import { getReview } from "../../../api/starsApi";
import { getUserFavoriteList } from "../../../api/mypageApi";
import { addFavorite, deleteFavorite } from "../../../api/mypageApi";

interface CustomPopupCardProps {
    item: SearchResult | null;
    position: { x: number; y: number } | null;
    onClose: () => void;
    onFavoriteToggle: (item: SearchResult) => void;
    onDetailClick: (areaId: number) => void;
    isItemFavorite: (type: string, placeId: string | number) => boolean;
    isLogin: boolean;
}

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

interface Summary {
    negativeCount: number;
    positiveCount: number;
    negativeKeywords: string[];
    positiveKeywords: string[];
}

interface FavoriteItem {
    type: string;
    placeId?: string | number;
    id?: string | number;
    place_id?: string | number;
}

export default function CustomPopupCard({
    item,
    position,
    onClose,
    onFavoriteToggle,
    onDetailClick,
    isItemFavorite,
    isLogin,
}: CustomPopupCardProps) {
    if (!item || !position) return null;

    const [review, setReview] = useState<Summary | null>(null);
    const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
    const [favoriteList, setFavoriteList] = useState<FavoriteItem[]>([]);
    const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
    const [currentIsFavorite, setCurrentIsFavorite] = useState(false);

    const popupRef = useRef<HTMLDivElement>(null);

    const placeId: string | number = item.id ?? item.place_id;

    // 팝업이 열릴 때마다 즐겨찾기 목록 조회
    useEffect(() => {
        const fetchFavorites = async () => {
            if (!isLogin) {
                setCurrentIsFavorite(false);
                return;
            }

            setIsLoadingFavorites(true);
            try {
                const favorites = await getUserFavoriteList();

                setFavoriteList(favorites || []);

                // 현재 아이템이 즐겨찾기에 있는지 확인
                const isInFavorites = (favorites || []).some(
                    (favorite: FavoriteItem) => {
                        const favoriteId =
                            favorite.placeId ??
                            favorite.id ??
                            favorite.place_id;
                        const currentId = placeId;

                        return (
                            favorite.type === item.type &&
                            String(favoriteId) === String(currentId)
                        );
                    }
                );
                setCurrentIsFavorite(isInFavorites);
            } catch (error) {
                console.error("즐겨찾기 목록 조회 실패:", error);
                setFavoriteList([]);
                setCurrentIsFavorite(false);
            } finally {
                setIsLoadingFavorites(false);
            }
        };

        fetchFavorites();
    }, [isLogin, item.type, placeId]); // 팝업이 열릴 때마다 조회

    // 리뷰 조회
    useEffect(() => {
        getReview(item.type, placeId as number).then((res) => {
            setReview(res as unknown as Summary);
        });
    }, [item.type, placeId]);

    // 즐겨찾기 상태 결정 (서버 데이터 우선, 로딩 중에는 기존 함수 사용)
    const isFavorite = isLoadingFavorites
        ? isLogin
            ? isItemFavorite(item.type, placeId)
            : false
        : currentIsFavorite;

    const badge = categoryBadge[item.type] ?? "bg-gray-100 text-gray-700";
    const label = categoryMap[item.type] ?? item.type;

    const handleFavoriteClick = async () => {
        if (!isLogin) {
            alert("즐겨찾기 기능은 로그인 후 이용 가능합니다.");
            return;
        }

        setIsLoadingFavorite(true);

        try {
            if (currentIsFavorite) {
                // 서버 기준 즐겨찾기 되어있으면 삭제 요청
                await deleteFavorite({
                    type: item.type,
                    place_id: placeId,
                });
            } else {
                // 서버 기준 즐겨찾기 안되어있으면 추가 요청
                await addFavorite({
                    type: item.type,
                    place_id: placeId,
                });
            }

            // 요청 후 목록 재조회로 상태 동기화
            const updatedFavorites = await getUserFavoriteList();
            setFavoriteList(updatedFavorites || []);
            const isInFavorites = (updatedFavorites || []).some(
                (favorite: FavoriteItem) => {
                    const favoriteId =
                        favorite.placeId ?? favorite.id ?? favorite.place_id;
                    return (
                        favorite.type === item.type &&
                        String(favoriteId) === String(placeId)
                    );
                }
            );
            setCurrentIsFavorite(isInFavorites);
            onFavoriteToggle(item);
        } catch (error) {
            console.error("즐겨찾기 토글 실패:", error);
        } finally {
            setIsLoadingFavorite(false);
        }
    };

    const handleDetailClick = () => {
        if (item.area_id) {
            onDetailClick(item.area_id);
            onClose();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (
                popupRef.current &&
                !popupRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [onClose]);

    return (
        <>
            {/* 팝업 카드 */}
            <div
                ref={popupRef}
                className="absolute z-30 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm min-w-[280px]"
                style={{
                    left: position.x,
                    top: position.y,
                    transform: "translate(-50%, -105%)", // 마커 위쪽에 표시
                }}
            >
                <div className="flex flex-col gap-3">
                    {/* 헤더 */}
                    <div className="flex items-start gap-2 justify-between">
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-800 leading-tight">
                                {item.name}
                            </h3>
                            <span
                                className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold mt-1 ${badge}`}
                            >
                                {label}
                            </span>
                        </div>

                        {/* 즐겨찾기 버튼 */}
                        {item.type !== "cultural_event" &&
                            item.type !== "culturalevent" && (
                                <button
                                    onClick={handleFavoriteClick}
                                    disabled={
                                        isLoadingFavorite || isLoadingFavorites
                                    }
                                    className="bg-white rounded-full shadow-md p-2 hover:shadow-lg transition-shadow disabled:opacity-50"
                                >
                                    {isLoadingFavorite || isLoadingFavorites ? (
                                        // 로딩 스피너
                                        <svg
                                            className="w-5 h-5 text-gray-400 animate-spin"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                    ) : isFavorite ? (
                                        <svg
                                            className="w-5 h-5 text-yellow-400"
                                            fill="currentColor"
                                            viewBox="0 0 22 20"
                                        >
                                            <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                        </svg>
                                    ) : (
                                        <svg
                                            className="w-5 h-5 text-gray-300"
                                            fill="currentColor"
                                            viewBox="0 0 22 20"
                                        >
                                            <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.30L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                        </svg>
                                    )}
                                </button>
                            )}
                    </div>

                    {/* 주소 */}
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {item.address}
                    </p>

                    {/* 전화번호 */}
                    {item.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.09 4.18 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.72c.13.81.37 1.6.7 2.34a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.74.33 1.53.57 2.34.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            <a
                                href={`tel:${item.phone.replace(/[^0-9]/g, "")}`}
                                className="text-blue-600 hover:underline"
                            >
                                {item.phone}
                            </a>
                        </div>
                    )}

                    {/* 리뷰 키워드 배지 */}
                    {review &&
                        (review.positiveKeywords.length > 1 ||
                            review.negativeKeywords.length > 1) && (
                            <div className="space-y-2">
                                {/* 긍정 키워드 */}
                                {review.positiveKeywords.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-1 mb-1">
                                            <svg
                                                className="w-4 h-4 text-green-500"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="text-sm font-medium text-green-700">
                                                긍정 리뷰 (
                                                {review.positiveCount})
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {review.positiveKeywords.map(
                                                (keyword, index) => (
                                                    <span
                                                        key={`positive-${index}`}
                                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                                    >
                                                        #{keyword}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 부정 키워드 */}
                                {review.negativeKeywords.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-1 mb-1">
                                            <svg
                                                className="w-4 h-4 text-red-500"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="text-sm font-medium text-red-700">
                                                부정 리뷰 (
                                                {review.negativeCount})
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {review.negativeKeywords.map(
                                                (keyword, index) => (
                                                    <span
                                                        key={`negative-${index}`}
                                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                                                    >
                                                        #{keyword}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    {/* 지도 링크 */}
                    <div className="flex items-center gap-3">
                        {item.kakaomap_url && (
                            <a
                                href={item.kakaomap_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-80 transition-opacity"
                            >
                                <img
                                    src="/kakaoMap.png"
                                    alt="카카오맵"
                                    className="w-8 h-8"
                                />
                            </a>
                        )}
                        {item.name && (
                            <a
                                href={`https://map.naver.com/p/search/${encodeURIComponent(item.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-80 transition-opacity"
                            >
                                <img
                                    src="/naverMap.png"
                                    alt="네이버지도"
                                    className="w-8 h-8"
                                />
                            </a>
                        )}
                    </div>

                    {/* 상세보기 버튼 */}
                    <button
                        onClick={handleDetailClick}
                        className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors text-sm"
                    >
                        가까운 지역구 보기
                    </button>
                </div>

                {/* 화살표 */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
                </div>
            </div>
        </>
    );
}
