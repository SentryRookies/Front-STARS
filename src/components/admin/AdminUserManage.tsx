import React, { useState, useEffect, useCallback, useMemo } from "react";
import AdminHeader from "./AdminHeader";
import { getUserList } from "../../api/adminApi";
import UserInsightDashboard from "./AdminUserInsight";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    const [users, setUsers] = useState<UserInfo[]>([]);
    // const [processedUsers, setprocessedUsers] = useState<UserInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [stats, setStats] = useState<UserStats | null>(null);

    // 필터 상태
    // const [searchInput, setSearchInput] = useState<string>(""); // 실시간 입력값 (디바운싱 적용)
    const [searchTerm, setSearchTerm] = useState<string>(""); // 실제 검색에 사용되는 값
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [genderFilter, setGenderFilter] = useState<string>("all");
    const [ageRangeFilter, setAgeRangeFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [showFilters, setShowFilters] = useState(false);

    // 페이지네이션
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // 모바일 대응
    const [isMobileView, setIsMobileView] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");

    // 인사이트 정보 창
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

    useEffect(() => {
        setLoading(true);
        try {
            getUserList().then((response) => {
                const data = response as unknown as UserInfo[];
                setUsers(data);
                // setprocessedUsers(data);
                calculateStats(data);
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    // 통계 계산
    const calculateStats = useCallback((userList: UserInfo[]) => {
        const currentYear = new Date().getFullYear();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const newStats: UserStats = {
            totalUsers: userList.length,
            adminUsers: userList.filter((u) => u.role === "ROLE_ADMIN").length,
            regularUsers: userList.filter((u) => u.role === "ROLE_USER").length,
            maleUsers: userList.filter((u) => u.gender === "male").length,
            femaleUsers: userList.filter((u) => u.gender === "female").length,
            newUsersThisWeek: userList.filter(
                (u) => new Date(u.created_at) >= oneWeekAgo
            ).length,
            averageAge:
                userList.length > 0
                    ? Math.round(
                          userList.reduce(
                              (sum, u) => sum + (currentYear - u.birth_year),
                              0
                          ) / userList.length
                      )
                    : 0,
        };

        setStats(newStats);
    }, []);

    // 필터링 및 정렬
    const processedUsers = useMemo(() => {
        let filtered = [...users];

        // 검색 필터
        if (searchTerm.trim()) {
            filtered = filtered.filter(
                (user) =>
                    user.user_id
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    user.nickname
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
            );
        }

        // 역할 필터
        if (roleFilter !== "all") {
            filtered = filtered.filter((user) => user.role === roleFilter);
        }

        // 성별 필터
        if (genderFilter !== "all") {
            filtered = filtered.filter((user) => user.gender === genderFilter);
        }

        // 연령대 필터
        if (ageRangeFilter !== "all") {
            const currentYear = new Date().getFullYear();
            filtered = filtered.filter((user) => {
                const age = currentYear - user.birth_year;
                switch (ageRangeFilter) {
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

            switch (sortBy) {
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
                    aValue = a[sortBy as keyof UserInfo];
                    bValue = b[sortBy as keyof UserInfo];
            }

            if (sortOrder === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [
        users,
        searchTerm,
        roleFilter,
        genderFilter,
        ageRangeFilter,
        sortBy,
        sortOrder,
    ]);

    // 필터 초기화
    const resetFilters = () => {
        setSearchTerm("");
        setRoleFilter("all");
        setGenderFilter("all");
        setAgeRangeFilter("all");
        setSortBy("created_at");
        setSortOrder("desc");
    };

    // 페이지네이션 계산
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = processedUsers.slice(
        indexOfFirstItem,
        indexOfLastItem
    );
    const totalPages = Math.ceil(processedUsers.length / itemsPerPage);

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

    useEffect(() => {
        calculateStats(processedUsers);
        setCurrentPage(1);
    }, [processedUsers, calculateStats]);

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
            : "bg-blue-100 text-blue-800 border-blue-200";
    };

    // 성별 아이콘
    const getGenderIcon = (gender: string) => {
        return gender === "male" ? "👨" : "👩";
    };

    // MBTI 색상
    const getMBTIColor = (mbti: string) => {
        const colors = {
            E: "bg-red-100 text-red-700",
            I: "bg-blue-100 text-blue-700",
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

    // 필터 섹션 컴포넌트
    const FilterSection = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                    필터 및 검색
                </h3>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="md:hidden px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
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
                                className={`p-2 rounded-md ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-md ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                    />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div
                className={`space-y-4 ${!showFilters && isMobileView ? "hidden" : ""}`}
            >
                {/* 검색바 */}
                <div className="relative">
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
                        placeholder="사용자 ID나 닉네임으로 검색..."
                        value={searchTerm} // 또는 searchInput (디바운싱 사용 시)
                        onChange={(e) => setSearchTerm(e.target.value)} // 또는 setSearchInput (디바운싱 사용 시)
                        className="block w-full pl-10 pr-3 py-2 border text-gray-600 border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* 필터 옵션들 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 역할 필터 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            역할
                        </label>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="block w-full px-3 py-2 border bg-white text-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">모든 역할</option>
                            <option value="ROLE_USER">일반 사용자</option>
                            <option value="ROLE_ADMIN">관리자</option>
                        </select>
                    </div>

                    {/* 성별 필터 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            성별
                        </label>
                        <select
                            value={genderFilter}
                            onChange={(e) => setGenderFilter(e.target.value)}
                            className="block w-full px-3 py-2 border bg-white text-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">모든 성별</option>
                            <option value="male">남성</option>
                            <option value="female">여성</option>
                        </select>
                    </div>

                    {/* 연령대 필터 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            연령대
                        </label>
                        <select
                            value={ageRangeFilter}
                            onChange={(e) => setAgeRangeFilter(e.target.value)}
                            className="block w-full px-3 py-2 border bg-white text-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">모든 연령</option>
                            <option value="teens">10대</option>
                            <option value="twenties">20대</option>
                            <option value="thirties">30대</option>
                            <option value="forties">40대</option>
                            <option value="fifties">50대 이상</option>
                        </select>
                    </div>

                    {/* 정렬 옵션 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            정렬
                        </label>
                        <div className="flex space-x-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="flex-1 px-3 py-2 border bg-white text-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="created_at">가입일</option>
                                <option value="nickname">닉네임</option>
                                <option value="age">나이</option>
                            </select>
                            <button
                                onClick={() =>
                                    setSortOrder(
                                        sortOrder === "asc" ? "desc" : "asc"
                                    )
                                }
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                {sortOrder === "asc" ? "↑" : "↓"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 활성 필터 표시 */}
                {(searchTerm ||
                    roleFilter !== "all" ||
                    genderFilter !== "all" ||
                    ageRangeFilter !== "all") && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-600">
                            활성 필터:
                        </span>
                        {searchTerm && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                검색: {searchTerm}
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                    }}
                                    className="ml-1 bg-blue-100 text-blue-600 hover:text-blue-800"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {roleFilter !== "all" && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                역할:{" "}
                                {roleFilter === "ROLE_ADMIN"
                                    ? "관리자"
                                    : "일반사용자"}
                                <button
                                    onClick={() => setRoleFilter("all")}
                                    className="ml-1 bg-green-100 text-green-600 hover:text-green-800"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {genderFilter !== "all" && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                성별:{" "}
                                {genderFilter === "male" ? "남성" : "여성"}
                                <button
                                    onClick={() => setGenderFilter("all")}
                                    className="ml-1 bg-purple-100 text-purple-600 hover:text-purple-800"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {ageRangeFilter !== "all" && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                연령:{" "}
                                {ageRangeFilter === "teens"
                                    ? "10대"
                                    : ageRangeFilter === "twenties"
                                      ? "20대"
                                      : ageRangeFilter === "thirties"
                                        ? "30대"
                                        : ageRangeFilter === "forties"
                                          ? "40대"
                                          : "50대+"}
                                <button
                                    onClick={() => setAgeRangeFilter("all")}
                                    className="ml-1 bg-orange-100 text-orange-600 hover:text-orange-800"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                    </div>
                )}
            </div>
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
                <div className="flex items-center justify-between">
                    {/* 페이지 정보 - 왼쪽 */}
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

                    {/* 페이지네이션 버튼들 - 가운데 */}
                    <div className="flex items-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
                        {/* 이전 페이지 버튼 */}
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

                        {/* 페이지 번호들 */}
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
                                                ? "bg-blue-600 text-white"
                                                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )}
                            </React.Fragment>
                        ))}

                        {/* 다음 페이지 버튼 */}
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

                    {/* 오른쪽 빈 공간 (균형을 위해) */}
                    <div></div>
                </div>

                {/* 모바일용 페이징 (sm 이하에서만 표시) */}
                <div className="flex justify-between sm:hidden mt-4 pt-4 border-t border-gray-200">
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
                            <div className="text-lg md:text-2xl font-bold text-blue-600">
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
                            className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 md:p-4 rounded-lg shadow-sm border border-blue-200 hover:shadow-md hover:from-blue-100 hover:to-purple-100 transition-all cursor-pointer"
                            onClick={() => setIsInsightModalOpen(true)}
                        >
                            <div className="text-lg md:text-2xl font-bold text-blue-600">
                                📊 사용자 분석
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">
                                상세 인사이트 보기
                            </div>
                        </div>
                    </div>
                )}

                {/* 필터 섹션 */}
                <FilterSection />

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
                                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all duration-200 bg-white"
                                            onClick={() =>
                                                handleUserClick(user)
                                            }
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
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

                                            <div className="space-y-2 mb-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">
                                                        나이
                                                    </span>
                                                    <span className="font-medium text-gray-600">
                                                        {getGenderIcon(
                                                            user.gender
                                                        )}{" "}
                                                        {calculateAge(
                                                            user.birth_year
                                                        )}
                                                        세
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">
                                                        MBTI
                                                    </span>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${getMBTIColor(user.mbti)}`}
                                                    >
                                                        {user.mbti}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">
                                                        가입일
                                                    </span>
                                                    <span className="text-gray-500">
                                                        {getRelativeTime(
                                                            user.created_at
                                                        )}
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
                                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
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
                                                            className="bg-white border-gray-500 text-blue-600 hover:text-blue-900"
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
                                        className="text-gray-400 hover:text-gray-600"
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
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
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
