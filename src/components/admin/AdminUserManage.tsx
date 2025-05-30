import React, { useState, useEffect, useCallback, useMemo } from "react";
import AdminHeader from "./AdminHeader";
import { getUserList } from "../../api/adminApi";
import UserInsightDashboard from "./AdminUserInsight";
import {
    Menu,
    Grid,
    ChevronLeft,
    ChevronRight,
    Filter,
    Search,
    User,
    Users,
    Calendar,
    X,
} from "lucide-react";

// 사용자 정보 타입 정의
interface UserInfo {
    member_id: number;
    user_id: string;
    nickname: string;
    birth_year: number;
    mbti: string;
    gender: "male" | "female";
    role: "ROLE_USER" | "ROLE_ADMIN";
    created_at: string;
}

// 통계 정보 타입
interface UserStats {
    totalUsers: number;
    adminUsers: number;
    regularUsers: number;
    maleUsers: number;
    femaleUsers: number;
    newUsersThisWeek: number;
    averageAge: number;
}

const AdminUserManagement: React.FC = () => {
    const [userList, setUserList] = useState<UserInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [stats, setStats] = useState<UserStats | null>(null);

    // 필터 상태
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [roleFilterValue, setRoleFilterValue] = useState<string>("all");
    const [genderFilterValue, setGenderFilterValue] = useState<string>("all");
    const [ageRangeFilterValue, setAgeRangeFilterValue] =
        useState<string>("all");
    const [sortByValue, setSortByValue] = useState<string>("created_at");
    const [sortOrderValue, setSortOrderValue] = useState<"asc" | "desc">(
        "desc"
    );
    const [showFilters, setShowFilters] = useState(false);

    // 페이지네이션
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [isMobileView, setIsMobileView] = useState<boolean>(false);
    const [isInsightModalOpen, setIsInsightModalOpen] =
        useState<boolean>(false);

    // 윈도우 크기 감지
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobileView(mobile);
            if (mobile) setViewMode("grid");
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // 검색어 변경 핸들러
    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchQuery(e.target.value);
        },
        []
    );

    // 검색 초기화
    const clearSearch = useCallback(() => {
        setSearchQuery("");
    }, []);

    // 필터 초기화
    const resetFilters = useCallback(() => {
        setSearchQuery("");
        setRoleFilterValue("all");
        setGenderFilterValue("all");
        setAgeRangeFilterValue("all");
        setSortByValue("created_at");
        setSortOrderValue("desc");
    }, []);

    // 데이터 로딩
    useEffect(() => {
        setLoading(true);
        getUserList()
            .then((response) => {
                const data = response as unknown as UserInfo[];
                setUserList(data);
                calculateStats(data);
            })
            .catch((e) => {
                console.error(e);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // 통계 계산
    const calculateStats = useCallback((users: UserInfo[]) => {
        const currentYear = new Date().getFullYear();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const newStats: UserStats = {
            totalUsers: users.length,
            adminUsers: users.filter((u) => u.role === "ROLE_ADMIN").length,
            regularUsers: users.filter((u) => u.role === "ROLE_USER").length,
            maleUsers: users.filter((u) => u.gender === "male").length,
            femaleUsers: users.filter((u) => u.gender === "female").length,
            newUsersThisWeek: users.filter(
                (u) => new Date(u.created_at) >= oneWeekAgo
            ).length,
            averageAge:
                users.length > 0
                    ? Math.round(
                          users.reduce(
                              (sum, u) => sum + (currentYear - u.birth_year),
                              0
                          ) / users.length
                      )
                    : 0,
        };

        setStats(newStats);
    }, []);

    // 필터링 및 정렬된 사용자 목록
    const processedUsers = useMemo(() => {
        let filtered = [...userList];

        // 검색 필터
        if (searchQuery.trim()) {
            const lowerSearchTerm = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (user) =>
                    user.user_id.toLowerCase().includes(lowerSearchTerm) ||
                    user.nickname.toLowerCase().includes(lowerSearchTerm)
            );
        }

        // 역할 필터
        if (roleFilterValue !== "all") {
            filtered = filtered.filter((user) => user.role === roleFilterValue);
        }

        // 성별 필터
        if (genderFilterValue !== "all") {
            filtered = filtered.filter(
                (user) => user.gender === genderFilterValue
            );
        }

        // 연령대 필터
        if (ageRangeFilterValue !== "all") {
            const currentYear = new Date().getFullYear();
            filtered = filtered.filter((user) => {
                const age = currentYear - user.birth_year;
                switch (ageRangeFilterValue) {
                    case "teens":
                        return age >= 10 && age < 20;
                    case "twenties":
                        return age >= 20 && age < 30;
                    case "thirties":
                        return age >= 30 && age < 40;
                    case "forties":
                        return age >= 40 && age < 50;
                    case "fifties":
                        return age >= 50;
                    default:
                        return true;
                }
            });
        }

        // 정렬
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sortByValue) {
                case "created_at":
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
                    break;
                case "nickname":
                    aValue = a.nickname;
                    bValue = b.nickname;
                    break;
                case "age":
                    aValue = new Date().getFullYear() - a.birth_year;
                    bValue = new Date().getFullYear() - b.birth_year;
                    break;
                default:
                    aValue = a[sortByValue as keyof UserInfo];
                    bValue = b[sortByValue as keyof UserInfo];
            }

            if (sortOrderValue === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [
        userList,
        searchQuery,
        roleFilterValue,
        genderFilterValue,
        ageRangeFilterValue,
        sortByValue,
        sortOrderValue,
    ]);

    // 페이지네이션 계산
    const currentItemsPerPage = useMemo(() => {
        return viewMode === "grid" || isMobileView ? 9 : 10;
    }, [viewMode, isMobileView]);

    const indexOfLastItem = currentPage * currentItemsPerPage;
    const indexOfFirstItem = indexOfLastItem - currentItemsPerPage;
    const currentUsers = processedUsers.slice(
        indexOfFirstItem,
        indexOfLastItem
    );
    const totalPages = Math.ceil(processedUsers.length / currentItemsPerPage);

    // 필터가 변경될 때마다 페이지를 1로 리셋
    useEffect(() => {
        setCurrentPage(1);
    }, [
        searchQuery,
        roleFilterValue,
        genderFilterValue,
        ageRangeFilterValue,
        sortByValue,
        sortOrderValue,
    ]);

    // 사용자 상세 보기
    const handleUserClick = (user: UserInfo) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    // 날짜 포맷팅
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // 상대적 시간 계산
    const getRelativeTime = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "오늘";
        if (diffDays === 1) return "어제";
        if (diffDays < 7) return `${diffDays}일 전`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
        return `${Math.floor(diffDays / 30)}개월 전`;
    };

    // 나이 계산
    const calculateAge = (birthYear: number) => {
        return new Date().getFullYear() - birthYear;
    };

    // 역할 배지 스타일
    const getRoleBadgeStyle = (role: string) => {
        return role === "ROLE_ADMIN"
            ? "bg-red-100 text-red-800 border-red-200"
            : "bg-indigo-100 text-indigo-800 border-indigo-200";
    };

    // 성별 아이콘
    const getGenderIcon = (gender: string) => {
        return gender === "male" ? "👨" : "👩";
    };

    // MBTI 색상
    const getMBTIColor = (mbti: string) => {
        const colors = {
            E: "bg-red-100 text-red-700",
            I: "bg-indigo-100 text-indigo-700",
            S: "bg-green-100 text-green-700",
            N: "bg-purple-100 text-purple-700",
            T: "bg-orange-100 text-orange-700",
            F: "bg-pink-100 text-pink-700",
            J: "bg-indigo-100 text-indigo-700",
            P: "bg-yellow-100 text-yellow-700",
        };
        return (
            colors[mbti[0] as keyof typeof colors] ||
            "bg-gray-100 text-gray-700"
        );
    };

    // 검색 입력 컴포넌트를 완전히 분리 - key prop으로 강제 안정화
    const SearchInputComponent = (
        <div key="search-input-stable" className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </div>
            <input
                type="text"
                placeholder="사용자 ID나 닉네임으로 실시간 검색..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-10 py-2 border text-gray-600 border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {searchQuery && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                        onClick={clearSearch}
                        className="p-1 text-gray-500 hover:text-red-500 bg-white hover:bg-red-50 rounded-full focus:outline-none transition-colors"
                        title="검색 초기화"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );

    // 페이지네이션 컴포넌트
    const Pagination = () => {
        if (totalPages <= 1) return null;

        const getVisiblePages = () => {
            const delta = 2;
            const range = [];
            const rangeWithDots = [];

            for (
                let i = Math.max(2, currentPage - delta);
                i <= Math.min(totalPages - 1, currentPage + delta);
                i++
            ) {
                range.push(i);
            }

            if (currentPage - delta > 2) {
                rangeWithDots.push(1, "...");
            } else {
                rangeWithDots.push(1);
            }

            rangeWithDots.push(...range);

            if (currentPage + delta < totalPages - 1) {
                rangeWithDots.push("...", totalPages);
            } else {
                rangeWithDots.push(totalPages);
            }

            return rangeWithDots;
        };

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-4">
                {/* 데스크톱용 페이징 */}
                <div className="hidden sm:flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        <span className="font-medium">
                            {indexOfFirstItem + 1}
                        </span>
                        {" - "}
                        <span className="font-medium">
                            {Math.min(indexOfLastItem, processedUsers.length)}
                        </span>
                        {" / "}
                        <span className="font-medium">
                            {processedUsers.length}
                        </span>
                        개 항목
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() =>
                                setCurrentPage(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                currentPage === 1
                                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {getVisiblePages().map((page, index) => (
                            <React.Fragment key={index}>
                                {page === "..." ? (
                                    <span className="px-3 py-2 text-sm text-gray-500">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        onClick={() =>
                                            setCurrentPage(page as number)
                                        }
                                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            currentPage === page
                                                ? "bg-indigo-600 text-white"
                                                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )}
                            </React.Fragment>
                        ))}

                        <button
                            onClick={() =>
                                setCurrentPage(
                                    Math.min(totalPages, currentPage + 1)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                currentPage === totalPages
                                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div></div>
                </div>

                {/* 모바일용 페이징 */}
                <div className="sm:hidden">
                    <div className="text-center text-sm text-gray-700 mb-4">
                        <span className="font-medium">
                            {indexOfFirstItem + 1}
                        </span>
                        {" - "}
                        <span className="font-medium">
                            {Math.min(indexOfLastItem, processedUsers.length)}
                        </span>
                        {" / "}
                        <span className="font-medium">
                            {processedUsers.length}
                        </span>
                        개 항목
                    </div>

                    <div className="flex justify-between items-center">
                        <button
                            onClick={() =>
                                setCurrentPage(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                currentPage === 1
                                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            이전
                        </button>

                        <div className="flex items-center text-sm text-gray-700">
                            <span className="font-medium">{currentPage}</span>
                            <span className="mx-2">/</span>
                            <span className="font-medium">{totalPages}</span>
                        </div>

                        <button
                            onClick={() =>
                                setCurrentPage(
                                    Math.min(totalPages, currentPage + 1)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                currentPage === totalPages
                                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            다음
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // 로딩 스켈레톤
    const LoadingSkeleton = () => (
        <div className="animate-pulse space-y-4 p-4">
            {[...Array(5)].map((_, idx) => (
                <div
                    key={idx}
                    className="bg-white p-4 rounded-lg shadow border"
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="w-20 h-6 bg-gray-200 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col w-full">
            {/* 헤더 */}
            <AdminHeader path={"/manage"} />

            <div className="flex-1 p-4 space-y-6">
                {/* 통계 카드 섹션 */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
                        <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border">
                            <div className="text-lg md:text-2xl font-bold text-indigo-600">
                                {stats.totalUsers}
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">
                                총 사용자
                            </div>
                        </div>
                        <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border">
                            <div className="text-lg md:text-2xl font-bold text-red-600">
                                {stats.adminUsers}
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">
                                관리자
                            </div>
                        </div>
                        <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border">
                            <div className="text-lg md:text-2xl font-bold text-green-600">
                                {stats.regularUsers}
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">
                                일반 사용자
                            </div>
                        </div>
                        <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border">
                            <div className="text-lg md:text-2xl font-bold text-purple-600">
                                {stats.newUsersThisWeek}
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">
                                신규 (주간)
                            </div>
                        </div>
                        <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border">
                            <div className="text-lg md:text-2xl font-bold text-indigo-600">
                                {stats.maleUsers}
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">
                                남성
                            </div>
                        </div>
                        <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border">
                            <div className="text-lg md:text-2xl font-bold text-pink-600">
                                {stats.femaleUsers}
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">
                                여성
                            </div>
                        </div>
                        <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border">
                            <div className="text-lg md:text-2xl font-bold text-orange-600">
                                {stats.averageAge}
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">
                                평균 연령
                            </div>
                        </div>
                        <div
                            className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 md:p-4 rounded-lg shadow-sm border border-indigo-200 hover:shadow-md hover:from-indigo-100 hover:to-purple-100 transition-all cursor-pointer"
                            onClick={() => setIsInsightModalOpen(true)}
                        >
                            <div className="text-lg md:text-2xl font-bold text-indigo-600">
                                사용자 분석
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">
                                상세 인사이트 보기
                            </div>
                        </div>
                    </div>
                )}

                {/* 필터 섹션 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            필터 및 검색
                        </h3>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="md:hidden px-3 py-2 text-sm font-medium text-white bg-indigo-500 border  rounded-md transition-colors"
                            >
                                {showFilters ? "필터 숨기기" : "필터 보기"}
                            </button>
                            <button
                                onClick={resetFilters}
                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                초기화
                            </button>
                            {!isMobileView && (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-indigo-500 text-indigo-100" : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-500"}`}
                                    >
                                        <Menu className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-indigo-500 text-indigo-100" : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-500"}`}
                                    >
                                        <Grid className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div
                        className={`space-y-4 ${!showFilters && isMobileView ? "hidden" : ""}`}
                    >
                        {/* 실시간 검색바 */}
                        {SearchInputComponent}

                        {/* 나머지 필터 옵션들 - 컴팩트하게 */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {/* 역할 필터 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    역할
                                </label>
                                <select
                                    value={roleFilterValue}
                                    onChange={(e) =>
                                        setRoleFilterValue(e.target.value)
                                    }
                                    className="block w-full px-2.5 py-1.5 text-sm border bg-white text-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="all">전체</option>
                                    <option value="ROLE_USER">일반</option>
                                    <option value="ROLE_ADMIN">관리자</option>
                                </select>
                            </div>

                            {/* 성별 필터 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    성별
                                </label>
                                <select
                                    value={genderFilterValue}
                                    onChange={(e) =>
                                        setGenderFilterValue(e.target.value)
                                    }
                                    className="block w-full px-2.5 py-1.5 text-sm border bg-white text-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="all">전체</option>
                                    <option value="male">남성</option>
                                    <option value="female">여성</option>
                                </select>
                            </div>

                            {/* 연령대 필터 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    연령대
                                </label>
                                <select
                                    value={ageRangeFilterValue}
                                    onChange={(e) =>
                                        setAgeRangeFilterValue(e.target.value)
                                    }
                                    className="block w-full px-2.5 py-1.5 text-sm border bg-white text-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="all">전체</option>
                                    <option value="teens">10대</option>
                                    <option value="twenties">20대</option>
                                    <option value="thirties">30대</option>
                                    <option value="forties">40대</option>
                                    <option value="fifties">50대+</option>
                                </select>
                            </div>

                            {/* 정렬 옵션 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    정렬
                                </label>
                                <div className="flex space-x-1">
                                    <select
                                        value={sortByValue}
                                        onChange={(e) =>
                                            setSortByValue(e.target.value)
                                        }
                                        className="flex-1 px-2.5 py-1.5 text-sm border bg-white text-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="created_at">
                                            가입일
                                        </option>
                                        <option value="nickname">닉네임</option>
                                        <option value="age">나이</option>
                                    </select>
                                    <button
                                        onClick={() =>
                                            setSortOrderValue(
                                                sortOrderValue === "asc"
                                                    ? "desc"
                                                    : "asc"
                                            )
                                        }
                                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        title={
                                            sortOrderValue === "asc"
                                                ? "내림차순으로 변경"
                                                : "오름차순으로 변경"
                                        }
                                    >
                                        {sortOrderValue === "asc" ? "↑" : "↓"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 활성 필터 표시 */}
                        {(searchQuery ||
                            roleFilterValue !== "all" ||
                            genderFilterValue !== "all" ||
                            ageRangeFilterValue !== "all") && (
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                        활성 필터
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {searchQuery && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm">
                                            <Search className="w-3.5 h-3.5" />
                                            <span>검색: {searchQuery}</span>
                                            <button
                                                onClick={clearSearch}
                                                className="ml-1 p-0.5 rounded-full hover:bg-indigo-200 transition-colors"
                                            >
                                                <X className="w-3 h-3 text-indigo-600" />
                                            </button>
                                        </span>
                                    )}

                                    {roleFilterValue !== "all" && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                                            <User className="w-3.5 h-3.5" />
                                            <span>
                                                역할:{" "}
                                                {roleFilterValue ===
                                                "ROLE_ADMIN"
                                                    ? "관리자"
                                                    : "일반사용자"}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    setRoleFilterValue("all")
                                                }
                                                className="ml-1 p-0.5 rounded-full bg-gray-100 hover:bg-emerald-200 transition-colors"
                                            >
                                                <X className="w-3 h-3 text-emerald-600" />
                                            </button>
                                        </span>
                                    )}

                                    {genderFilterValue !== "all" && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border border-rose-200 shadow-sm">
                                            <Users className="w-3.5 h-3.5" />
                                            <span>
                                                성별:{" "}
                                                {genderFilterValue === "male"
                                                    ? "남성"
                                                    : "여성"}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    setGenderFilterValue("all")
                                                }
                                                className="ml-1 p-0.5 rounded-full bg-gray-100 hover:bg-rose-200 transition-colors"
                                            >
                                                <X className="w-3 h-3 text-rose-600" />
                                            </button>
                                        </span>
                                    )}

                                    {ageRangeFilterValue !== "all" && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200 shadow-sm">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>
                                                연령:{" "}
                                                {ageRangeFilterValue === "teens"
                                                    ? "10대"
                                                    : ageRangeFilterValue ===
                                                        "twenties"
                                                      ? "20대"
                                                      : ageRangeFilterValue ===
                                                          "thirties"
                                                        ? "30대"
                                                        : ageRangeFilterValue ===
                                                            "forties"
                                                          ? "40대"
                                                          : "50대+"}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    setAgeRangeFilterValue(
                                                        "all"
                                                    )
                                                }
                                                className="ml-1 p-0.5 rounded-full bg-gray-100 hover:bg-amber-200 transition-colors"
                                            >
                                                <X className="w-3 h-3 text-amber-600" />
                                            </button>
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 검색 결과 요약 */}
                        {processedUsers.length !== userList.length && (
                            <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="h-5 w-5 text-indigo-400"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-indigo-700">
                                            전체 {userList.length}명 중{" "}
                                            <strong>
                                                {processedUsers.length}명
                                            </strong>
                                            이 필터 조건과 일치합니다.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <LoadingSkeleton />
                ) : currentUsers.length > 0 ? (
                    <>
                        {viewMode === "grid" || isMobileView ? (
                            // 카드 뷰 (모바일 & 그리드 모드)
                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {currentUsers.map((user) => (
                                        <div
                                            key={user.member_id}
                                            className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all duration-200 bg-white"
                                            onClick={() =>
                                                handleUserClick(user)
                                            }
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                        {user.nickname.charAt(
                                                            0
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 text-lg">
                                                            {user.nickname}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            @{user.user_id}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end space-y-1">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeStyle(user.role)}`}
                                                    >
                                                        {user.role ===
                                                        "ROLE_ADMIN"
                                                            ? "관리자"
                                                            : "사용자"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // 테이블 뷰 (데스크톱)
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    사용자
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    정보
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    MBTI
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    역할
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    가입일
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    작업
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {currentUsers.map((user) => (
                                                <tr
                                                    key={user.member_id}
                                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                                    onClick={() =>
                                                        handleUserClick(user)
                                                    }
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                                                                {user.nickname.charAt(
                                                                    0
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {
                                                                        user.nickname
                                                                    }
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    @
                                                                    {
                                                                        user.user_id
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {getGenderIcon(
                                                                user.gender
                                                            )}{" "}
                                                            {calculateAge(
                                                                user.birth_year
                                                            )}
                                                            세
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {user.birth_year}
                                                            년생
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getMBTIColor(user.mbti)}`}
                                                        >
                                                            {user.mbti}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeStyle(user.role)}`}
                                                        >
                                                            {user.role ===
                                                            "ROLE_ADMIN"
                                                                ? "관리자"
                                                                : "사용자"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div>
                                                            <div>
                                                                {formatDate(
                                                                    user.created_at
                                                                )}
                                                            </div>
                                                            <div className="text-xs">
                                                                {getRelativeTime(
                                                                    user.created_at
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUserClick(
                                                                    user
                                                                );
                                                            }}
                                                            className="bg-white border-gray-500 text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            상세
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 페이지네이션 */}
                        {totalPages > 1 && <Pagination />}
                    </>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
                        <svg
                            className="w-12 h-12 text-gray-400 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                            사용자를 찾을 수 없습니다
                        </h3>
                        <p className="text-gray-500">
                            검색 조건을 변경해보세요.
                        </p>
                    </div>
                )}

                {/* 사용자 상세 모달 */}
                {isModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div
                                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                                onClick={() => setIsModalOpen(false)}
                            ></div>

                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
                                &#8203;
                            </span>

                            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        사용자 상세 정보
                                    </h3>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-white bg-indigo-500 hover:bg-indigo-600"
                                    >
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* 프로필 섹션 */}
                                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                            {selectedUser.nickname.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-semibold text-gray-900">
                                                {selectedUser.nickname}
                                            </h4>
                                            <p className="text-gray-600">
                                                @{selectedUser.user_id}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeStyle(selectedUser.role)}`}
                                                >
                                                    {selectedUser.role ===
                                                    "ROLE_ADMIN"
                                                        ? "관리자"
                                                        : "사용자"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 상세 정보 */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                성별
                                            </label>
                                            <div className="text-sm text-gray-900">
                                                {getGenderIcon(
                                                    selectedUser.gender
                                                )}{" "}
                                                {selectedUser.gender === "male"
                                                    ? "남성"
                                                    : "여성"}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                나이
                                            </label>
                                            <div className="text-sm text-gray-900">
                                                {calculateAge(
                                                    selectedUser.birth_year
                                                )}
                                                세 ({selectedUser.birth_year}
                                                년생)
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                MBTI
                                            </label>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getMBTIColor(selectedUser.mbti)}`}
                                            >
                                                {selectedUser.mbti}
                                            </span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                가입일
                                            </label>
                                            <div className="text-sm text-gray-900">
                                                {formatDate(
                                                    selectedUser.created_at
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <UserInsightDashboard
                    users={processedUsers}
                    isVisible={isInsightModalOpen}
                    onClose={() => setIsInsightModalOpen(false)}
                />
            </div>
        </div>
    );
};

export default AdminUserManagement;
