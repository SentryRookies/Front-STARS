// Enhanced UserFavorite.tsx with improved design
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Favorite } from "../../../data/adminData";
import { getUserFavoriteList, deleteFavorite } from "../../../api/mypageApi";

// 카테고리 타입별 정의
const categoryMap: Record<string, string> = {
    accommodation: "숙박",
    attraction: "관광명소",
    cafe: "카페",
    restaurant: "음식점",
    culturalevent: "문화행사",
};

// 타입별 색상 및 아이콘 정의
const typeStyles: Record<
    string,
    { color: string; bgColor: string; icon: string }
> = {
    accommodation: {
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        icon: "🏨",
    },
    attraction: {
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        icon: "🎭",
    },
    cafe: {
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        icon: "☕",
    },
    restaurant: {
        color: "text-red-600",
        bgColor: "bg-red-50",
        icon: "🍽️",
    },
    culturalevent: {
        color: "text-violet-600",
        bgColor: "bg-violet-50",
        icon: "🎫",
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

    // 모바일 여부를 저장하는 상태
    const [isMobile, setIsMobile] = useState(false);

    // 즐겨찾기 데이터 로드 함수
    const loadFavorites = async () => {
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
    };

    // 화면 크기가 변경될 때 모바일 여부 감지
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // 초기 체크
        checkIfMobile();

        // 리사이즈 이벤트 리스너 추가
        window.addEventListener("resize", checkIfMobile);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener("resize", checkIfMobile);
        };
    }, []);

    // 컴포넌트 마운트 시 즐겨찾기 데이터 로드
    useEffect(() => {
        loadFavorites();
    }, []);

    // 삭제 핸들러
    const handleDelete = async (fav: Favorite) => {
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
    };

    // 필터링된 즐겨찾기 목록
    const filteredFavorites = favorites.filter((item) => {
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

    // 항목 확장 토글
    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // 특정 타입에 따른 스타일 가져오기
    const getTypeStyle = (type: string) => {
        return typeStyles[type] || defaultStyle;
    };

    // 로딩 스켈레톤 컴포넌트
    const FavoriteCardSkeleton = () => (
        <div className="animate-pulse bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                    <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
            <div className="mt-3 h-3 bg-gray-200 rounded w-full"></div>
        </div>
    );

    // 오류 메시지 컴포넌트
    const ErrorMessage = () => (
        <motion.div
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <svg
                className="w-12 h-12 text-red-500 mb-3"
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
            <h3 className="text-lg font-bold mb-2">오류 발생</h3>
            <p className="mb-4">{error}</p>
            <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                onClick={loadFavorites}
            >
                다시 시도
            </button>
        </motion.div>
    );

    // 아무것도 없을 때 표시할 컴포넌트
    const EmptyState = () => (
        <motion.div
            className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex flex-col items-center">
                <svg
                    className="w-16 h-16 text-gray-400 mb-4"
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
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                    등록된 즐겨찾기가 없습니다
                </h3>
                <p className="text-gray-500 mb-6">
                    지도에서 마음에 드는 장소를 즐겨찾기에 추가해보세요!
                </p>
                <button
                    onClick={() => window.fullpage_api?.moveSlideLeft()}
                    className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
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
                    지도로 돌아가기
                </button>
            </div>
        </motion.div>
    );

    // 카테고리 필터 버튼
    const CategoryFilter = () => {
        const categories = [
            { id: "all", name: "전체" },
            ...Object.entries(categoryMap).map(([id, name]) => ({ id, name })),
        ];

        return (
            <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => {
                    const isSelected = selectedCategory === category.id;
                    const type = category.id !== "all" ? category.id : "";
                    const style = getTypeStyle(type);

                    return (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                isSelected
                                    ? `bg-indigo-600 text-white`
                                    : `${style.bgColor} ${style.color} hover:bg-indigo-100`
                            }`}
                        >
                            {category.id !== "all" && (
                                <span className="mr-1">{style.icon}</span>
                            )}
                            {category.name}
                        </button>
                    );
                })}
            </div>
        );
    };

    // 메인 컴포넌트 렌더링
    return (
        <div className="space-y-6">
            {/* 헤더와 검색 영역 */}
            <motion.div
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <span className="mr-2 text-xl">⭐</span>
                        즐겨찾기
                    </h2>
                    <button
                        onClick={loadFavorites}
                        className="text-indigo-600 bg-white shadow hover:text-indigo-800 flex items-center text-sm"
                        disabled={isLoading}
                    >
                        <svg
                            className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        {isLoading ? "로딩 중..." : "새로고침"}
                    </button>
                </div>

                {/* 검색 입력 필드 */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="장소명 또는 주소로 검색..."
                        className="w-full px-4 py-2 pl-10 border bg-white text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
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
                    {searchTerm && (
                        <button
                            className="absolute right-3 top-1/2 transform bg-white -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            onClick={() => setSearchTerm("")}
                        >
                            <svg
                                className="w-4 h-4"
                                xmlns="http://www.w3.org/2000/svg"
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

                {/* 카테고리 필터 버튼 */}
                <CategoryFilter />
            </motion.div>

            {/* 로딩 상태 및 데이터 */}
            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <FavoriteCardSkeleton key={idx} />
                    ))}
                </div>
            ) : error ? (
                <ErrorMessage />
            ) : filteredFavorites.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {filteredFavorites.map((item) => {
                            const typeStyle = getTypeStyle(item.type);
                            const isExpanded = expandedId === item.favorite_id;

                            return (
                                <motion.div
                                    key={item.favorite_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 ${
                                        isExpanded
                                            ? "border-indigo-500"
                                            : `border-l-${typeStyle.color.split("-")[1]}-500`
                                    }`}
                                >
                                    <div
                                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() =>
                                            toggleExpand(item.favorite_id)
                                        }
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start">
                                                <div
                                                    className={`flex items-center justify-center w-10 h-10 rounded-full mr-3 ${typeStyle.bgColor}`}
                                                >
                                                    <span className="text-lg">
                                                        {typeStyle.icon}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {item.address}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <span
                                                    className={`text-xs px-2.5 py-1 rounded-full ${typeStyle.bgColor} ${typeStyle.color} mr-2`}
                                                >
                                                    {categoryMap[item.type] ||
                                                        item.type}
                                                </span>
                                                <svg
                                                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "transform rotate-180" : ""}`}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 확장된 상세 정보 */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{
                                                    height: 0,
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    height: "auto",
                                                    opacity: 1,
                                                }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="px-4 pb-4 border-t border-gray-100"
                                            >
                                                <div className="pt-3 flex justify-between items-center">
                                                    <div className="text-xs text-gray-500">
                                                        즐겨찾기 ID:{" "}
                                                        {item.favorite_id}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm rounded-lg hover:bg-indigo-100 transition-colors flex items-center"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.fullpage_api?.moveSlideLeft();
                                                                // 여기에 지도에서 해당 위치로 이동하는 로직 추가
                                                            }}
                                                        >
                                                            <svg
                                                                className="w-4 h-4 mr-1"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                                                />
                                                            </svg>
                                                            지도에서 보기
                                                        </button>
                                                        <button
                                                            className="px-3 py-1.5 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 transition-colors flex items-center"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(
                                                                    item
                                                                );
                                                            }}
                                                            disabled={
                                                                deletingId ===
                                                                item.favorite_id
                                                            }
                                                        >
                                                            {deletingId ===
                                                            item.favorite_id ? (
                                                                <>
                                                                    <svg
                                                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600"
                                                                        xmlns="http://www.w3.org/2000/svg"
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
                                                                        ></circle>
                                                                        <path
                                                                            className="opacity-75"
                                                                            fill="currentColor"
                                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                        ></path>
                                                                    </svg>
                                                                    삭제 중...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <svg
                                                                        className="w-4 h-4 mr-1"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={
                                                                                2
                                                                            }
                                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                        />
                                                                    </svg>
                                                                    삭제하기
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* 모바일에서만 보이는 스크롤 안내 */}
            {isMobile && filteredFavorites.length > 3 && (
                <div className="text-center text-gray-500 text-xs mt-2">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                    >
                        스크롤하여 더 많은 항목 보기
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default UserFavorite;
