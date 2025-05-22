// Compact UserFavorite.tsx - 더 납작한 디자인
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Favorite } from "../../../data/adminData";
import { getUserFavoriteList, deleteFavorite } from "../../../api/mypageApi";

// 카테고리 타입별 정의
const categoryMap: Record<string, string> = {
    accommodation: "숙박",
    attraction: "관광명소",
    cafe: "카페",
    restaurant: "음식점",
};

// 타입별 색상 및 아이콘 정의
const typeStyles: Record<
    string,
    { color: string; bgColor: string; icon: string; borderColor: string }
> = {
    accommodation: {
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        icon: "🏨",
        borderColor: "border-blue-200",
    },
    attraction: {
        color: "text-green-600",
        bgColor: "bg-green-50",
        icon: "🎭",
        borderColor: "border-green-200",
    },
    cafe: {
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        icon: "☕",
        borderColor: "border-yellow-200",
    },
    restaurant: {
        color: "text-red-600",
        bgColor: "bg-red-50",
        icon: "🍽️",
        borderColor: "border-red-200",
    },
};

// 기본 스타일
const defaultStyle = {
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    icon: "📍",
};

const UserFavorite = () => {
    // 즐겨찾기 데이터 상태
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    // 로딩 상태
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // 에러 상태
    const [error, setError] = useState<string | null>(null);
    // 삭제 진행 중인 항목의 ID
    const [deletingId, setDeletingId] = useState<number | null>(null);
    // 필터 상태
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    // 확장된 항목 ID
    const [expandedId, setExpandedId] = useState<number | null>(null);
    // 검색어
    const [searchTerm, setSearchTerm] = useState<string>("");

    // 즐겨찾기 조회
    const loadFavorites = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getUserFavoriteList();

            if (response) {
                setFavorites(response);
                console.log(response);
            } else {
                setError("즐겨찾기 목록을 불러오는데 실패했습니다.");
                setFavorites([]);
            }
        } catch (err) {
            setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
            console.log(err);
            setFavorites([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 컴포넌트 마운트 시 즐겨찾기 데이터 로드
    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    // 삭제 핸들러
    const handleDelete = useCallback(
        async (fav: Favorite) => {
            if (window.confirm("즐겨찾기를 삭제하시겠습니까?")) {
                setDeletingId(fav.favorite_id);

                try {
                    const response = await deleteFavorite(fav);
                    console.log("삭제 결과: ", response);

                    if (response.message === "즐겨찾기 삭제 완료") {
                        // 성공적으로 삭제되면 상태에서도 삭제
                        await loadFavorites();
                    } else {
                        // 실패 시 알림
                        alert(response.message || "삭제에 실패했습니다.");
                    }
                } catch (err) {
                    alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
                    console.log(err);
                } finally {
                    setDeletingId(null); // 삭제 중 표시 제거
                }
            }
        },
        [loadFavorites]
    );

    // 필터링된 즐겨찾기 목록 - useMemo로 최적화
    const filteredFavorites = useMemo(() => {
        return favorites.filter((item) => {
            // 카테고리 필터
            const categoryMatch =
                selectedCategory === "all" || item.type === selectedCategory;

            // 검색어 필터
            const searchMatch =
                searchTerm === "" ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.address.toLowerCase().includes(searchTerm.toLowerCase());

            return categoryMatch && searchMatch;
        });
    }, [favorites, selectedCategory, searchTerm]);

    // 항목 확장 토글
    const toggleExpand = useCallback((id: number) => {
        setExpandedId((expandedId) => (expandedId === id ? null : id));
    }, []);

    // 특정 타입에 따른 스타일 가져오기
    const getTypeStyle = useCallback((type: string) => {
        return typeStyles[type] || defaultStyle;
    }, []);

    // 로딩 스켈레톤 컴포넌트
    const FavoriteCardSkeleton = React.memo(() => (
        <div className="animate-pulse bg-white rounded-lg shadow-sm p-3 border border-gray-100">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
                    <div>
                        <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                        <div className="h-2 bg-gray-200 rounded w-28"></div>
                    </div>
                </div>
                <div className="h-4 bg-gray-200 rounded-full w-12"></div>
            </div>
        </div>
    ));

    // 오류 메시지 컴포넌트
    const ErrorMessage = React.memo(() => (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex flex-col items-center text-center">
            <svg
                className="w-8 h-8 text-red-500 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            <h3 className="text-sm font-bold mb-1">오류 발생</h3>
            <p className="mb-3 text-sm">{error}</p>
            <button
                className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                onClick={loadFavorites}
            >
                다시 시도
            </button>
        </div>
    ));

    // 아무것도 없을 때 표시할 컴포넌트
    const EmptyState = React.memo(() => (
        <div className="bg-gradient-to-b from-indigo-50 to-white border border-indigo-100 rounded-lg p-8 text-center w-full flex flex-col items-center justify-center">
            <div className="max-w-md mx-auto flex flex-col items-center">
                <svg
                    className="w-16 h-16 text-indigo-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                </svg>
                <h3 className="text-xl font-bold text-indigo-700 mb-2">
                    등록된 즐겨찾기가 없습니다
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    지도에서 마음에 드는 장소를 찾아 즐겨찾기에 추가해보세요!
                </p>
                <button
                    onClick={() => window.fullpage_api?.moveSlideLeft()}
                    className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 flex items-center text-sm font-medium shadow hover:shadow-lg transition-all"
                >
                    <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                    </svg>
                    지도로 돌아가기
                </button>
            </div>
        </div>
    ));

    // 즐겨찾기 카드 컴포넌트
    const FavoriteCard = React.memo(({ fav }: { fav: Favorite }) => {
        const style = getTypeStyle(fav.type);
        const isExpanded = expandedId === fav.favorite_id;
        const isDeleting = deletingId === fav.favorite_id;

        return (
            <div
                className={`bg-white rounded-xl shadow-md p-4 border-2 ${style.borderColor} relative overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] transform duration-200`}
            >
                {/* 삭제 중 오버레이 */}
                {isDeleting && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-xl">
                        <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-lg">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3"></div>
                            <p className="text-sm text-gray-600 font-medium">
                                삭제 중...
                            </p>
                        </div>
                    </div>
                )}

                {/* 카드 헤더 */}
                <div
                    className="flex justify-between items-center cursor-pointer ml-2"
                    onClick={() => toggleExpand(fav.favorite_id)}
                >
                    <div className="flex items-center flex-1 min-w-0">
                        {/*<div*/}
                        {/*    className={`w-10 h-10 rounded-xl ${style.bgColor} flex items-center justify-center mr-3 flex-shrink-0 shadow-sm`}*/}
                        {/*>*/}
                        {/*    <span className="text-lg">{style.icon}</span>*/}
                        {/*</div>*/}
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-800 text-sm truncate mb-1">
                                {fav.name}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">
                                {fav.address}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 flex-shrink-0 ml-3">
                        <span
                            className={`text-xs ${style.color} ${style.bgColor} px-3 py-1 rounded-full font-semibold shadow-sm border ${style.borderColor}`}
                        >
                            {categoryMap[fav.type] || fav.type}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(fav.favorite_id);
                            }}
                            className="text-gray-400 bg-white hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <svg
                                className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 확장 영역 */}
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t-2 border-gray-100 transition-all duration-300">
                        <div className="flex justify-between gap-3">
                            <button
                                onClick={() => {
                                    // 지도에서 해당 위치로 이동 구현
                                    if (window.fullpage_api) {
                                        window.fullpage_api.moveSlideLeft();
                                        // 지도 컴포넌트로 위치 정보 전달 로직 추가
                                    }
                                }}
                                className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg text-sm flex items-center font-medium shadow-sm border border-indigo-200 transition-colors"
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                    />
                                </svg>
                                지도에서 보기
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(fav);
                                }}
                                className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg text-sm flex items-center font-medium shadow-sm border border-red-200 transition-colors"
                                disabled={isDeleting}
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                                삭제
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    });

    // 카테고리 필터 버튼
    const CategoryFilter = React.memo(() => {
        const categories = useMemo(
            () => [
                { id: "all", name: "전체" },
                ...Object.entries(categoryMap).map(([id, name]) => ({
                    id,
                    name,
                })),
            ],
            []
        );

        return (
            <div className="flex flex-wrap gap-1.5 mb-3">
                {categories.map((category) => {
                    const isSelected = selectedCategory === category.id;
                    const type = category.id !== "all" ? category.id : "";
                    const style = getTypeStyle(type);

                    return (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                                isSelected
                                    ? `bg-indigo-600 text-white`
                                    : `${style.bgColor} ${style.color} hover:bg-indigo-100`
                            }`}
                        >
                            {category.id !== "all" && (
                                <span className="mr-0.5">{style.icon}</span>
                            )}
                            {category.name}
                        </button>
                    );
                })}
            </div>
        );
    });

    // 메인 컴포넌트 렌더링
    return (
        <div className="flex flex-col h-full min-h-full">
            {/* 헤더와 검색 영역 */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 sticky top-0 z-10 flex-shrink-0">
                {/* 검색 입력 필드 */}
                <div className="relative mb-3">
                    <input
                        type="text"
                        placeholder="장소명 또는 주소로 검색..."
                        className="w-full px-3 py-2 pl-8 border bg-white text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg
                        className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>

                {/* 카테고리 필터 버튼과 새로고침 버튼 */}
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <CategoryFilter />
                    </div>
                    {/* 에러가 발생하면 거기서 새로고침이 뜨는데 굳이 위에 추가로 만들 필요 없어보임 */}
                    {/*<button*/}
                    {/*    className="text-indigo-600 bg-white shadow-sm hover:text-indigo-800 flex items-center text-xs px-2 py-1.5 rounded ml-3 border border-gray-200"*/}
                    {/*    onClick={loadFavorites}*/}
                    {/*>*/}
                    {/*    <svg*/}
                    {/*        className="w-3 h-3 mr-1"*/}
                    {/*        xmlns="http://www.w3.org/2000/svg"*/}
                    {/*        fill="none"*/}
                    {/*        viewBox="0 0 24 24"*/}
                    {/*        stroke="currentColor"*/}
                    {/*    >*/}
                    {/*        <path*/}
                    {/*            strokeLinecap="round"*/}
                    {/*            strokeLinejoin="round"*/}
                    {/*            strokeWidth={2}*/}
                    {/*            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"*/}
                    {/*        />*/}
                    {/*    </svg>*/}
                    {/*    새로고침*/}
                    {/*</button>*/}
                </div>
            </div>

            {/* 컨텐츠 영역 */}
            <div className="flex-1 p-3 overflow-y-auto">
                {isLoading ? (
                    // 로딩 중
                    <div className="space-y-2">
                        {Array(5)
                            .fill(0)
                            .map((_, index) => (
                                <FavoriteCardSkeleton key={index} />
                            ))}
                    </div>
                ) : error ? (
                    // 오류 발생
                    <ErrorMessage />
                ) : filteredFavorites.length === 0 ? (
                    // 즐겨찾기 없음
                    <EmptyState />
                ) : (
                    // 즐겨찾기 목록
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-2 gap-3 items-start">
                        {filteredFavorites.map((favorite) => (
                            <FavoriteCard
                                key={favorite.favorite_id}
                                fav={favorite}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserFavorite;
