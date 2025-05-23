import React, { useState, useEffect } from "react";
import { UserFavoriteList, Favorite } from "../../data/adminData";
import AdminHeader from "./AdminHeader";
import { getFavoriteList } from "../../api/adminApi";
import { useLocation } from "react-router-dom";
import FavoriteCard from "./cards/FavoriteCard";
import UserList from "./cards/UserList";

// 카테고리 한글 매핑
const categoryMap: Record<string, string> = {
    accommodation: "숙박",
    attraction: "관광명소",
    cafe: "카페",
    restaurant: "음식점",
};
const reverseCategoryMap: Record<string, string> = Object.entries(
    categoryMap
).reduce(
    (acc, [en, ko]) => {
        acc[ko] = en;
        return acc;
    },
    {} as Record<string, string>
);
const categoryList = ["전체", ...Object.values(categoryMap)];

// 로딩 스켈레톤 컴포넌트
const UserSkeleton = () => (
    <div className="p-3 border-b animate-pulse">
        <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 mr-3"></div>
            <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
        </div>
    </div>
);

const FavoriteSkeleton = () => (
    <div className="p-3 rounded-lg shadow bg-gray-50 animate-pulse">
        <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-48 mt-3"></div>
    </div>
);

const AdminUserFavorite = () => {
    const location = useLocation();

    const [userFavorites, setUserFavorites] = useState<UserFavoriteList[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [currentFavorites, setCurrentFavorites] = useState<Favorite[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filteredUsers, setFilteredUsers] = useState<UserFavoriteList[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [favoriteLoading, setFavoriteLoading] = useState<boolean>(false);

    // 모바일 대응
    const [isMobileView, setIsMobileView] = useState<boolean>(false);
    // 0: 사용자, 1: 즐겨찾기, 2: 전체순위
    const [mobileTab, setMobileTab] = useState<number>(0);

    // 카테고리 필터
    const [selectedTypeCategory, setSelectedTypeCategory] =
        useState<string>("전체");
    const [selectedRankingCategory, setSelectedRankingCategory] =
        useState<string>("전체");

    // 윈도우 크기 감지
    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // 모바일에서 사용자 선택 시 즐겨찾기 목록으로 전환
    useEffect(() => {
        if (isMobileView && selectedUserId) setMobileTab(1);
    }, [selectedUserId, isMobileView]);

    // 데이터 로드
    useEffect(() => {
        setLoading(true);
        getFavoriteList()
            .then((response) => {
                setUserFavorites(response);
                setFilteredUsers(response);
                if (response.length > 0 && !selectedUserId) {
                    setSelectedUserId(response[0].user_id);
                }
            })
            .catch((e) => console.error(e))
            .finally(() => setLoading(false));
    }, [location.pathname]);

    // 즐겨찾기 로드
    useEffect(() => {
        if (selectedUserId) {
            setFavoriteLoading(true);
            const selectedUser = userFavorites.find(
                (user) => user.user_id === selectedUserId
            );
            setCurrentFavorites(selectedUser ? selectedUser.content : []);
            setFavoriteLoading(false);
        } else {
            setCurrentFavorites([]);
        }
    }, [selectedUserId, userFavorites]);

    // 검색어 필터
    useEffect(() => {
        if (searchTerm) {
            const filtered = userFavorites.filter((user) =>
                user.user_id.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(userFavorites);
        }
    }, [searchTerm, userFavorites]);

    // 타입별 색상 및 아이콘
    const getTypeStylesAndIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case "cafe":
                return {
                    bg: "bg-yellow-50",
                    border: "border-yellow-200",
                    text: "text-yellow-800",
                    tag: "bg-yellow-100",
                    tagText: "text-yellow-800",
                    icon: "☕",
                };
            case "restaurant":
                return {
                    bg: "bg-red-50",
                    border: "border-red-200",
                    text: "text-red-800",
                    tag: "bg-red-100",
                    tagText: "text-red-800",
                    icon: "🍽️",
                };
            case "accommodation":
                return {
                    bg: "bg-blue-50",
                    border: "border-blue-200",
                    text: "text-blue-800",
                    tag: "bg-blue-100",
                    tagText: "text-blue-800",
                    icon: "🏨",
                };
            case "attraction":
                return {
                    bg: "bg-green-50",
                    border: "border-green-200",
                    text: "text-green-800",
                    tag: "bg-green-100",
                    tagText: "text-green-800",
                    icon: "🎭",
                };
            default:
                return {
                    bg: "bg-gray-50",
                    border: "border-gray-200",
                    text: "text-gray-800",
                    tag: "bg-gray-100",
                    tagText: "text-gray-800",
                    icon: "📍",
                };
        }
    };

    // 타입별 필터 버튼
    const TypeFilter = ({
        selected,
        setSelected,
    }: {
        selected: string;
        setSelected: (v: string) => void;
        label?: string;
    }) => (
        <div className="p-4 border-b overflow-x-auto overflow-y-hidden scrollbar-hide whitespace-nowrap flex gap-2 items-center">
            {categoryList.map((ko) => {
                const type = reverseCategoryMap[ko];
                const styles = getTypeStylesAndIcon(type ?? "");
                const isSelected = selected === ko;
                return (
                    <button
                        key={ko}
                        className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 transition-colors duration-150
                            ${
                                isSelected
                                    ? "bg-blue-600 text-white"
                                    : `${styles.tag} ${styles.tagText} border border-transparent hover:border-blue-400`
                            }`}
                        onClick={() => setSelected(ko)}
                    >
                        {ko === "전체" ? "전체" : `${styles.icon} ${ko}`}
                    </button>
                );
            })}
        </div>
    );

    // 필터링된 즐겨찾기
    const filteredCurrentFavorites = React.useMemo(() => {
        if (selectedTypeCategory === "전체") return currentFavorites;
        const type = reverseCategoryMap[selectedTypeCategory];
        return currentFavorites.filter((item) => item.type === type);
    }, [currentFavorites, selectedTypeCategory]);

    // 전체 순위 집계
    const favoriteRanking = React.useMemo(() => {
        const countMap: Record<string, { item: Favorite; count: number }> = {};
        userFavorites.forEach((user) => {
            user.content.forEach((fav) => {
                const key = fav.name + fav.type;
                if (!countMap[key]) {
                    countMap[key] = { item: fav, count: 1 };
                } else {
                    countMap[key].count += 1;
                }
            });
        });
        return Object.values(countMap).sort((a, b) => b.count - a.count);
    }, [userFavorites]);

    // 전체 순위 카테고리 필터
    const filteredRanking = React.useMemo(() => {
        if (selectedRankingCategory === "전체") return favoriteRanking;
        const type = reverseCategoryMap[selectedRankingCategory];
        return favoriteRanking.filter(({ item }) => item.type === type);
    }, [favoriteRanking, selectedRankingCategory]);

    // 사용자 ID 기반 색상
    const getUserColor = (userId: string | undefined) => {
        if (!userId) return "bg-gray-100";
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = userId.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = [
            "bg-blue-100",
            "bg-green-100",
            "bg-yellow-100",
            "bg-red-100",
        ];
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    // 새로고침
    const handleRefresh = () => {
        setLoading(true);
        getFavoriteList()
            .then((response) => {
                setUserFavorites(response);
                setFilteredUsers(response);
            })
            .catch((e) => console.error(e))
            .finally(() => setLoading(false));
    };

    // 모바일 뒤로가기 (사용자 목록)
    const handleBack = () => setMobileTab(0);

    return (
        <div className="bg-gray-100 flex flex-col w-full app-full-height overflow-hidden">
            <AdminHeader path={"/manage"} />
            <div className="p-2 sm:p-4 flex-1 overflow-y-auto flex flex-col">
                {/* 모바일: 사용자 목록에서 즐겨찾기/전체순위로 이동 시 뒤로가기 */}
                {isMobileView && mobileTab !== 0 && (
                    <div className="mb-2 flex">
                        <button
                            onClick={handleBack}
                            className="flex items-center text-blue-600 mb-1 bg-white"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            사용자 목록으로 돌아가기
                        </button>
                    </div>
                )}

                {/* PC: 3분할 레이아웃 */}
                {!isMobileView ? (
                    <div className="w-full h-full flex flex-col flex-1">
                        {/* 상단 2분할 */}
                        <div className="flex flex-row flex-none h-[55%] min-h-[350px]">
                            {/* 좌측상단: 사용자 목록 */}
                            <div className="w-1/3 bg-white rounded-lg shadow-md flex flex-col h-full mr-4">
                                <h2 className="text-lg md:text-xl p-4 font-bold text-black border-b flex justify-between items-center flex-shrink-0">
                                    <span>사용자 목록</span>
                                    <div className="flex items-center">
                                        {loading && (
                                            <span className="text-sm text-blue-500 font-normal mr-2">
                                                로딩 중...
                                            </span>
                                        )}
                                        <button
                                            onClick={handleRefresh}
                                            className="ml-2 text-sm bg-white text-black hover:text-blue-500"
                                            title="새로고침"
                                            disabled={loading}
                                        >
                                            새로고침
                                        </button>
                                    </div>
                                </h2>
                                {/* 검색창 */}
                                <div className="p-3 border-b flex-shrink-0">
                                    <input
                                        type="text"
                                        placeholder="사용자 ID 검색..."
                                        className="w-full px-3 py-2 border rounded-lg text-black bg-gray-50 focus:ring-2 focus:ring-blue-500"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        disabled={loading}
                                    />
                                </div>
                                {/* 사용자 목록 */}
                                <UserList
                                    users={filteredUsers}
                                    loading={loading}
                                    selectedUserId={selectedUserId}
                                    onSelect={setSelectedUserId}
                                    getUserColor={getUserColor}
                                    SkeletonItem={UserSkeleton}
                                />
                            </div>
                            {/* 우측상단: 즐겨찾기 */}
                            <div className="w-2/3 bg-white rounded-lg shadow-md flex flex-col h-full">
                                <h2 className="text-lg md:text-xl p-3 font-bold text-black border-b flex justify-between items-center flex-shrink-0">
                                    <span>
                                        {selectedUserId
                                            ? `@${selectedUserId}님의 즐겨찾기`
                                            : "즐겨찾기 목록"}
                                    </span>
                                    <div className="flex items-center">
                                        {favoriteLoading && (
                                            <span className="text-sm text-blue-500 font-normal mr-2">
                                                로딩 중...
                                            </span>
                                        )}
                                        <span className="text-sm text-gray-500 font-normal">
                                            총 {currentFavorites.length}개
                                        </span>
                                    </div>
                                </h2>
                                <TypeFilter
                                    selected={selectedTypeCategory}
                                    setSelected={setSelectedTypeCategory}
                                />
                                <div className="p-4 overflow-y-auto flex-1">
                                    {loading || favoriteLoading ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                                            {[...Array(4)].map((_, index) => (
                                                <FavoriteSkeleton key={index} />
                                            ))}
                                        </div>
                                    ) : filteredCurrentFavorites.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-16 md:pb-4">
                                            {filteredCurrentFavorites.map(
                                                (item) => {
                                                    const typeStyles =
                                                        getTypeStylesAndIcon(
                                                            item.type
                                                        );
                                                    return (
                                                        <FavoriteCard
                                                            key={
                                                                item.favorite_id
                                                            }
                                                            item={item}
                                                            typeStyles={
                                                                typeStyles
                                                            }
                                                            categoryMap={
                                                                categoryMap
                                                            }
                                                            idType="favorite_id"
                                                        />
                                                    );
                                                }
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200 text-gray-500 h-full flex items-center justify-center">
                                            {selectedUserId
                                                ? "사용자의 즐겨찾기 항목이 없습니다."
                                                : "사용자를 선택해주세요."}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* 하단: 전체순위 */}
                        <div className="flex-1 mt-4 min-h-[200px]">
                            <div className="w-full bg-white rounded-lg shadow-md flex flex-col">
                                <h2 className="text-lg md:text-xl p-3 font-bold text-black border-b flex justify-between items-center flex-shrink-0">
                                    <span>전체 즐겨찾기 순위</span>
                                    <span className="text-sm text-gray-500 font-normal">
                                        총 {favoriteRanking.length}개
                                    </span>
                                </h2>
                                <TypeFilter
                                    selected={selectedRankingCategory}
                                    setSelected={setSelectedRankingCategory}
                                    label="카테고리:"
                                />
                                <div className="p-4 overflow-y-auto flex-1">
                                    {loading ? (
                                        <div className="grid grid-cols-4 gap-4">
                                            {[...Array(4)].map((_, index) => (
                                                <FavoriteSkeleton key={index} />
                                            ))}
                                        </div>
                                    ) : filteredRanking.length > 0 ? (
                                        <div className="flex flex-row gap-4 overflow-x-auto p-4 scrollbar-hide h-full items-stretch">
                                            {filteredRanking.map(
                                                ({ item, count }, idx) => {
                                                    const typeStyles =
                                                        getTypeStylesAndIcon(
                                                            item.type
                                                        );
                                                    return (
                                                        <div className="h-full flex flex-col min-w-[300px] max-w-xs flex-1">
                                                            <FavoriteCard
                                                                key={`${item.favorite_id}-${idx}`}
                                                                item={item}
                                                                typeStyles={
                                                                    typeStyles
                                                                }
                                                                categoryMap={
                                                                    categoryMap
                                                                }
                                                                idType="place_id"
                                                                extra={
                                                                    <span className="absolute -top-2 -left-2 bg-blue-400 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-lg shadow">
                                                                        {idx +
                                                                            1}
                                                                    </span>
                                                                }
                                                            >
                                                                <span className="text-xs text-gray-500">
                                                                    총 {count}명
                                                                </span>
                                                            </FavoriteCard>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200 text-gray-500">
                                            순위 데이터가 없습니다.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // 모바일: 기존 탭 방식
                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 flex-1 overflow-hidden">
                        {/* 사용자 목록 */}
                        {(!isMobileView || mobileTab === 0) && (
                            <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md flex flex-col h-full">
                                <h2 className="text-lg md:text-xl p-3 font-bold text-black border-b flex justify-between items-center flex-shrink-0">
                                    <span>사용자 목록</span>
                                    <div className="flex items-center">
                                        {loading && (
                                            <span className="text-sm text-blue-500 font-normal mr-2">
                                                로딩 중...
                                            </span>
                                        )}
                                        <button
                                            onClick={handleRefresh}
                                            className="ml-2 text-sm bg-white text-black hover:text-blue-500"
                                            title="새로고침"
                                            disabled={loading}
                                        >
                                            새로고침
                                        </button>
                                    </div>
                                </h2>
                                {/* 검색창 */}
                                <div className="p-3 border-b flex-shrink-0">
                                    <input
                                        type="text"
                                        placeholder="사용자 ID 검색..."
                                        className="w-full px-3 py-2 border rounded-lg text-black bg-gray-50 focus:ring-2 focus:ring-blue-500"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        disabled={loading}
                                    />
                                </div>
                                {/* 사용자 목록 */}
                                <UserList
                                    users={filteredUsers}
                                    loading={loading}
                                    selectedUserId={selectedUserId}
                                    onSelect={setSelectedUserId}
                                    getUserColor={getUserColor}
                                    SkeletonItem={UserSkeleton}
                                />
                            </div>
                        )}

                        {/* 즐겨찾기 목록 */}
                        {isMobileView && mobileTab === 1 && (
                            <div className="w-full bg-white rounded-lg shadow-md flex flex-col h-full">
                                <h2 className="text-lg md:text-xl p-3 font-bold text-black border-b flex justify-between items-center flex-shrink-0">
                                    <span>
                                        {selectedUserId
                                            ? `@${selectedUserId}님의 즐겨찾기`
                                            : "즐겨찾기 목록"}
                                    </span>
                                    <div className="flex items-center">
                                        {favoriteLoading && (
                                            <span className="text-sm text-blue-500 font-normal mr-2">
                                                로딩 중...
                                            </span>
                                        )}
                                        <span className="text-sm text-gray-500 font-normal">
                                            총 {currentFavorites.length}개
                                        </span>
                                    </div>
                                </h2>
                                <TypeFilter
                                    selected={selectedTypeCategory}
                                    setSelected={setSelectedTypeCategory}
                                />
                                <div className="p-4 overflow-y-auto mb-4 max-h-auto">
                                    {loading || favoriteLoading ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {[...Array(4)].map((_, index) => (
                                                <FavoriteSkeleton key={index} />
                                            ))}
                                        </div>
                                    ) : filteredCurrentFavorites.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4 h-full">
                                            {filteredCurrentFavorites.map(
                                                (item) => {
                                                    const typeStyles =
                                                        getTypeStylesAndIcon(
                                                            item.type
                                                        );
                                                    return (
                                                        <FavoriteCard
                                                            key={
                                                                item.favorite_id
                                                            }
                                                            item={item}
                                                            typeStyles={
                                                                typeStyles
                                                            }
                                                            categoryMap={
                                                                categoryMap
                                                            }
                                                            idType="favorite_id"
                                                        />
                                                    );
                                                }
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200 text-gray-500">
                                            {selectedUserId
                                                ? "사용자의 즐겨찾기 항목이 없습니다."
                                                : "사용자를 선택해주세요."}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 전체 순위 */}
                        {isMobileView && mobileTab === 2 && (
                            <div className="w-full bg-white rounded-lg shadow-md flex flex-col h-full">
                                <h2 className="text-lg md:text-xl p-3 font-bold text-black border-b flex justify-between items-center flex-shrink-0">
                                    <span>전체 즐겨찾기 순위</span>
                                    <span className="text-sm text-gray-500 font-normal">
                                        총 {favoriteRanking.length}개
                                    </span>
                                </h2>
                                <TypeFilter
                                    selected={selectedRankingCategory}
                                    setSelected={setSelectedRankingCategory}
                                />
                                <div className="p-4 overflow-y-auto mb-4 max-h-auto">
                                    {loading ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {[...Array(4)].map((_, index) => (
                                                <FavoriteSkeleton key={index} />
                                            ))}
                                        </div>
                                    ) : filteredRanking.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4 h-full">
                                            {filteredRanking.map(
                                                ({ item, count }, idx) => {
                                                    const typeStyles =
                                                        getTypeStylesAndIcon(
                                                            item.type
                                                        );
                                                    return (
                                                        <FavoriteCard
                                                            key={`${item.favorite_id}-${idx}`}
                                                            item={item}
                                                            typeStyles={
                                                                typeStyles
                                                            }
                                                            categoryMap={
                                                                categoryMap
                                                            }
                                                            idType="place_id"
                                                            extra={
                                                                <span className="absolute -top-2 -left-2 bg-blue-400 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-lg shadow">
                                                                    {idx + 1}
                                                                </span>
                                                            }
                                                        >
                                                            <span className="text-xs text-gray-500">
                                                                총 {count}명
                                                            </span>
                                                        </FavoriteCard>
                                                    );
                                                }
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200 text-gray-500">
                                            순위 데이터가 없습니다.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* 모바일 하단 네비게이션 */}
            {isMobileView && (
                <div className="flex bottom-0 left-0 right-0 bg-white border-t px-4 justify-around z-10">
                    <button
                        onClick={() => setMobileTab(0)}
                        className={`flex flex-col items-center ${mobileTab === 0 ? "text-blue-600" : "text-gray-500"} bg-white`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                        <span className="text-xs mt-1">사용자</span>
                    </button>
                    <button
                        onClick={() => setMobileTab(1)}
                        className={`flex flex-col items-center ${mobileTab === 1 ? "text-blue-600" : "text-gray-500"} bg-white`}
                        disabled={!selectedUserId}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                        <span className="text-xs mt-1">즐겨찾기</span>
                    </button>
                    <button
                        onClick={() => setMobileTab(2)}
                        className={`flex flex-col items-center ${mobileTab === 2 ? "text-blue-600" : "text-gray-500"} bg-white`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 17a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10z"
                            />
                        </svg>
                        <span className="text-xs mt-1">전체순위</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminUserFavorite;
