import React, { useState, useEffect } from "react";
import AdminHeader from "./AdminHeader";
import { getUserProfile } from "../../api/mypageApi";
import { getUserList } from "../../api/adminApi";

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
    const [filteredUsers, setFilteredUsers] = useState<UserInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [stats, setStats] = useState<UserStats | null>(null);

    // 필터 상태
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [genderFilter, setGenderFilter] = useState<string>("all");
    const [ageRangeFilter, setAgeRangeFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // 모바일 대응
    const [isMobileView, setIsMobileView] = useState<boolean>(false);

    // 윈도우 크기 감지
    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // 샘플 데이터 (실제로는 API에서 가져올 데이터)
    useEffect(() => {
        setTimeout(() => {
            fetchUserInfo();
        }, 1000);
    }, []);

    // 통계 계산
    const calculateStats = (userList: UserInfo[]) => {
        const currentYear = new Date().getFullYear();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const stats: UserStats = {
            totalUsers: userList.length,
            adminUsers: userList.filter((u) => u.role === "ROLE_ADMIN").length,
            regularUsers: userList.filter((u) => u.role === "ROLE_USER").length,
            maleUsers: userList.filter((u) => u.gender === "male").length,
            femaleUsers: userList.filter((u) => u.gender === "female").length,
            newUsersThisWeek: userList.filter(
                (u) => new Date(u.created_at) >= oneWeekAgo
            ).length,
            averageAge: Math.round(
                userList.reduce(
                    (sum, u) => sum + (currentYear - u.birth_year),
                    0
                ) / userList.length
            ),
        };

        setStats(stats);
    };

    // 필터링 및 정렬
    useEffect(() => {
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

        setFilteredUsers(filtered);
    }, [
        users,
        searchTerm,
        roleFilter,
        genderFilter,
        ageRangeFilter,
        sortBy,
        sortOrder,
    ]);

    const fetchUserInfo = () => {
        setLoading(true);
        getUserList()
            .then((response) => {
                console.log(response);
                const userDatas = response as unknown as UserInfo[];
                setUsers(userDatas);
                setFilteredUsers(userDatas);
                calculateStats(userDatas);
            })
            .catch((e) => {
                console.error(e);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // 사용자 상세 보기
    const handleUserClick = (user: UserInfo) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    // 역할 변경
    const handleRoleChange = (
        userId: string,
        newRole: "ROLE_USER" | "ROLE_ADMIN"
    ) => {
        setUsers((prev) =>
            prev.map((user) =>
                user.user_id === userId ? { ...user, role: newRole } : user
            )
        );
        if (selectedUser && selectedUser.user_id === userId) {
            setSelectedUser((prev) =>
                prev ? { ...prev, role: newRole } : null
            );
        }
    };

    // 사용자 삭제
    const handleDeleteUser = (userId: string) => {
        if (window.confirm("정말로 이 사용자를 삭제하시겠습니까?")) {
            setUsers((prev) => prev.filter((user) => user.user_id !== userId));
            setIsModalOpen(false);
            setSelectedUser(null);
        }
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

    // 로딩 스켈레톤
    const LoadingSkeleton = () => (
        <div className="animate-pulse space-y-4">
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
        <div className="bg-gray-100 min-h-screen flex flex-col w-full">
            <AdminHeader path={"/manage"} />

            <div className="flex-1 p-4 space-y-6">
                {/* 통계 카드 섹션 */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow border">
                            <div className="text-2xl font-bold text-blue-600">
                                {stats.totalUsers}
                            </div>
                            <div className="text-sm text-gray-600">
                                총 사용자
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border">
                            <div className="text-2xl font-bold text-red-600">
                                {stats.adminUsers}
                            </div>
                            <div className="text-sm text-gray-600">관리자</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border">
                            <div className="text-2xl font-bold text-green-600">
                                {stats.regularUsers}
                            </div>
                            <div className="text-sm text-gray-600">
                                일반 사용자
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border">
                            <div className="text-2xl font-bold text-purple-600">
                                {stats.newUsersThisWeek}
                            </div>
                            <div className="text-sm text-gray-600">
                                신규 (주간)
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border">
                            <div className="text-2xl font-bold text-indigo-600">
                                {stats.maleUsers}
                            </div>
                            <div className="text-sm text-gray-600">남성</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border">
                            <div className="text-2xl font-bold text-pink-600">
                                {stats.femaleUsers}
                            </div>
                            <div className="text-sm text-gray-600">여성</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border">
                            <div className="text-2xl font-bold text-orange-600">
                                {stats.averageAge}
                            </div>
                            <div className="text-sm text-gray-600">
                                평균 연령
                            </div>
                        </div>
                    </div>
                )}

                {/* 필터 및 검색 섹션 */}
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        {/* 검색 */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                사용자 검색
                            </label>
                            <input
                                type="text"
                                placeholder="아이디 또는 닉네임 검색..."
                                className="w-full px-3 py-2 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* 역할 필터 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                역할
                            </label>
                            <select
                                className="w-full px-3 py-2 border bg-white text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="all">전체</option>
                                <option value="ROLE_ADMIN">관리자</option>
                                <option value="ROLE_USER">일반 사용자</option>
                            </select>
                        </div>

                        {/* 성별 필터 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                성별
                            </label>
                            <select
                                className="w-full px-3 py-2 border text-gray-700 bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={genderFilter}
                                onChange={(e) =>
                                    setGenderFilter(e.target.value)
                                }
                            >
                                <option value="all">전체</option>
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
                                className="w-full px-3 py-2 border text-gray-700 bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={ageRangeFilter}
                                onChange={(e) =>
                                    setAgeRangeFilter(e.target.value)
                                }
                            >
                                <option value="all">전체</option>
                                <option value="teens">10대</option>
                                <option value="twenties">20대</option>
                                <option value="thirties">30대</option>
                                <option value="forties">40대</option>
                                <option value="fifties">50대 이상</option>
                            </select>
                        </div>

                        {/* 정렬 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                정렬
                            </label>
                            <select
                                className="w-full px-3 py-2 border text-gray-700 bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] =
                                        e.target.value.split("-");
                                    setSortBy(field);
                                    setSortOrder(order as "asc" | "desc");
                                }}
                            >
                                <option value="created_at-desc">
                                    최신 가입순
                                </option>
                                <option value="created_at-asc">
                                    오래된 가입순
                                </option>
                                <option value="nickname-asc">닉네임 순</option>
                                <option value="age-asc">나이 낮은 순</option>
                                <option value="age-desc">나이 높은 순</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 사용자 목록 */}
                <div className="bg-white rounded-lg shadow border">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-bold text-gray-900">
                            사용자 목록
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({filteredUsers.length}명)
                            </span>
                        </h2>
                    </div>

                    <div className="p-4">
                        {loading ? (
                            <LoadingSkeleton />
                        ) : filteredUsers.length > 0 ? (
                            isMobileView ? (
                                // 모바일 카드 뷰
                                <div className="space-y-3">
                                    {filteredUsers.map((user) => (
                                        <div
                                            key={user.member_id}
                                            className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() =>
                                                handleUserClick(user)
                                            }
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                        {user.nickname.charAt(
                                                            0
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">
                                                            {user.nickname}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            @{user.user_id} •{" "}
                                                            {calculateAge(
                                                                user.birth_year
                                                            )}
                                                            세
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
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
                            ) : (
                                // 데스크톱 테이블 뷰
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    사용자
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    정보
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    MBTI
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    역할
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    가입일
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    작업
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredUsers.map((user) => (
                                                <tr
                                                    key={user.member_id}
                                                    className="hover:bg-gray-50 cursor-pointer"
                                                    onClick={() =>
                                                        handleUserClick(user)
                                                    }
                                                >
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
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
                                                    <td className="px-4 py-4 whitespace-nowrap">
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
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getMBTIColor(user.mbti)}`}
                                                        >
                                                            {user.mbti}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeStyle(user.role)}`}
                                                        >
                                                            {user.role ===
                                                            "ROLE_ADMIN"
                                                                ? "관리자"
                                                                : "사용자"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(
                                                            user.created_at
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUserClick(
                                                                    user
                                                                );
                                                            }}
                                                            className="text-blue-600 bg-white border-gray-400 hover:text-blue-900 mr-3"
                                                        >
                                                            상세
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRoleChange(
                                                                    user.user_id,
                                                                    user.role ===
                                                                        "ROLE_ADMIN"
                                                                        ? "ROLE_USER"
                                                                        : "ROLE_ADMIN"
                                                                );
                                                            }}
                                                            className="text-green-600 bg-white border-gray-400 hover:text-green-900"
                                                        >
                                                            {user.role ===
                                                            "ROLE_ADMIN"
                                                                ? "권한해제"
                                                                : "관리자"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-12">
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserManagement;
