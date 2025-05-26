import React, { useMemo, useState } from "react";

// 사용자 정보 타입 (기존 컴포넌트와 동일)
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

// 인사이트 카테고리 타입
interface InsightData {
    ageDistribution: { [key: string]: number };
    genderDistribution: { [key: string]: number };
    mbtiDistribution: { [key: string]: number };
    roleDistribution: { [key: string]: number };
    registrationTrends: { [key: string]: number };
    mbtiGroups: { [key: string]: number };
    insights: string[];
    recommendations: string[];
}

interface Props {
    users: UserInfo[];
    isVisible: boolean;
    onClose: () => void;
}

const UserInsightDashboard: React.FC<Props> = ({
    users,
    isVisible,
    onClose,
}) => {
    const [activeTab, setActiveTab] = useState<
        "overview" | "demographics" | "mbti" | "trends"
    >("overview");

    // 인사이트 데이터 계산
    const insightData = useMemo<InsightData>(() => {
        if (!users.length) {
            return {
                ageDistribution: {},
                genderDistribution: {},
                mbtiDistribution: {},
                roleDistribution: {},
                registrationTrends: {},
                mbtiGroups: {},
                insights: [],
                recommendations: [],
            };
        }

        const currentYear = new Date().getFullYear();

        // 연령대 분포
        const ageDistribution: { [key: string]: number } = {};
        users.forEach((user) => {
            const age = currentYear - user.birth_year;
            const ageGroup =
                age < 20
                    ? "10대"
                    : age < 30
                      ? "20대"
                      : age < 40
                        ? "30대"
                        : age < 50
                          ? "40대"
                          : "50대 이상";
            ageDistribution[ageGroup] = (ageDistribution[ageGroup] || 0) + 1;
        });

        // 성별 분포
        const genderDistribution: { [key: string]: number } = {};
        users.forEach((user) => {
            const gender = user.gender === "male" ? "남성" : "여성";
            genderDistribution[gender] = (genderDistribution[gender] || 0) + 1;
        });

        // MBTI 분포
        const mbtiDistribution: { [key: string]: number } = {};
        users.forEach((user) => {
            mbtiDistribution[user.mbti] =
                (mbtiDistribution[user.mbti] || 0) + 1;
        });

        // 역할 분포
        const roleDistribution: { [key: string]: number } = {};
        users.forEach((user) => {
            const role = user.role === "ROLE_ADMIN" ? "관리자" : "일반사용자";
            roleDistribution[role] = (roleDistribution[role] || 0) + 1;
        });

        // 등록 트렌드 (최근 6개월)
        const registrationTrends: { [key: string]: number } = {};
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        for (let i = 0; i < 6; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "short",
            });
            registrationTrends[monthKey] = 0;
        }

        users.forEach((user) => {
            const userDate = new Date(user.created_at);
            if (userDate >= sixMonthsAgo) {
                const monthKey = userDate.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "short",
                });
                if (registrationTrends[monthKey] !== undefined) {
                    registrationTrends[monthKey]++;
                }
            }
        });

        // MBTI 그룹 분석 (NT, NF, ST, SF)
        const mbtiGroups: { [key: string]: number } = {
            "NT (분석가)": 0,
            "NF (외교관)": 0,
            "ST (관찰자)": 0,
            "SF (탐험가)": 0,
        };

        users.forEach((user) => {
            const mbti = user.mbti;
            if (mbti.includes("NT")) mbtiGroups["NT (분석가)"]++;
            else if (mbti.includes("NF")) mbtiGroups["NF (외교관)"]++;
            else if (mbti.includes("ST")) mbtiGroups["ST (관찰자)"]++;
            else if (mbti.includes("SF")) mbtiGroups["SF (탐험가)"]++;
        });

        // 인사이트 생성
        const insights: string[] = [];
        const recommendations: string[] = [];

        // 연령대 인사이트
        const dominantAgeGroup = Object.entries(ageDistribution).reduce(
            (a, b) => (a[1] > b[1] ? a : b)
        );
        insights.push(
            `가장 많은 사용자층은 ${dominantAgeGroup[0]}입니다 (${((dominantAgeGroup[1] / users.length) * 100).toFixed(1)}%)`
        );

        // 성별 비율 인사이트
        const maleRatio =
            ((genderDistribution["남성"] || 0) / users.length) * 100;
        const femaleRatio =
            ((genderDistribution["여성"] || 0) / users.length) * 100;
        insights.push(
            `성별 비율: 남성 ${maleRatio.toFixed(1)}%, 여성 ${femaleRatio.toFixed(1)}%`
        );

        // MBTI 인사이트
        const dominantMbti = Object.entries(mbtiDistribution).reduce((a, b) =>
            a[1] > b[1] ? a : b
        );
        insights.push(
            `가장 많은 MBTI 유형은 ${dominantMbti[0]}입니다 (${dominantMbti[1]}명)`
        );

        // 최근 가입 추세
        const recentMonths = Object.entries(registrationTrends).slice(0, 2);
        const trend = recentMonths[0][1] > recentMonths[1][1] ? "증가" : "감소";
        insights.push(`최근 신규 가입자 수가 ${trend} 추세입니다`);

        // 추천사항 생성
        if (maleRatio > 70 || femaleRatio > 70) {
            recommendations.push("성별 균형을 위한 타겟 마케팅을 고려해보세요");
        }

        if (dominantAgeGroup[1] / users.length > 0.5) {
            recommendations.push(
                `${dominantAgeGroup[0]} 외 연령층 확보를 위한 전략이 필요합니다`
            );
        }

        if (
            roleDistribution["관리자"] &&
            roleDistribution["관리자"] / users.length > 0.1
        ) {
            recommendations.push(
                "관리자 비율이 높습니다. 권한 관리를 점검해보세요"
            );
        }

        const totalRecent = Object.values(registrationTrends).reduce(
            (a, b) => a + b,
            0
        );
        if (totalRecent / users.length < 0.2) {
            recommendations.push(
                "신규 사용자 유입이 저조합니다. 마케팅 전략을 검토해보세요"
            );
        }

        return {
            ageDistribution,
            genderDistribution,
            mbtiDistribution,
            roleDistribution,
            registrationTrends,
            mbtiGroups,
            insights,
            recommendations,
        };
    }, [users]);

    // 차트용 색상 배열
    const colors = [
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-red-500",
        "bg-purple-500",
        "bg-indigo-500",
        "bg-pink-500",
        "bg-teal-500",
        "bg-orange-500",
        "bg-cyan-500",
    ];

    // 막대 차트 컴포넌트
    const BarChart: React.FC<{
        data: { [key: string]: number };
        title: string;
    }> = ({ data, title }) => {
        const maxValue = Math.max(...Object.values(data));
        const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

        return (
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 text-lg">
                    {title}
                </h4>
                <div className="space-y-3">
                    {entries.map(([key, value], index) => (
                        <div key={key} className="flex items-center">
                            <div className="w-24 text-sm text-gray-600 truncate">
                                {key}
                            </div>
                            <div className="flex-1 mx-3">
                                <div className="bg-gray-200 rounded-full h-6 relative">
                                    <div
                                        className={`h-6 rounded-full ${colors[index % colors.length]} transition-all duration-700 flex items-center justify-end pr-2`}
                                        style={{
                                            width: `${(value / maxValue) * 100}%`,
                                        }}
                                    >
                                        <span className="text-xs font-medium text-white">
                                            {(
                                                (value /
                                                    entries.reduce(
                                                        (sum, [, v]) => sum + v,
                                                        0
                                                    )) *
                                                100
                                            ).toFixed(1)}
                                            %
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-12 text-sm font-medium text-right text-gray-800">
                                {value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // 원형 차트 컴포넌트 (CSS로 구현)
    const PieChart: React.FC<{
        data: { [key: string]: number };
        title: string;
    }> = ({ data, title }) => {
        const total = Object.values(data).reduce((a, b) => a + b, 0);
        const entries = Object.entries(data);

        return (
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 text-lg">
                    {title}
                </h4>
                <div className="flex items-center justify-center mb-6">
                    <div
                        className="w-40 h-40 rounded-full relative"
                        style={{
                            background: `conic-gradient(${entries
                                .map(([key, value], index) => {
                                    const percentage = (value / total) * 100;
                                    const colorMap: { [key: string]: string } =
                                        {
                                            "bg-blue-500": "#3B82F6",
                                            "bg-green-500": "#10B981",
                                            "bg-yellow-500": "#F59E0B",
                                            "bg-red-500": "#EF4444",
                                            "bg-purple-500": "#8B5CF6",
                                        };
                                    return `${colorMap[colors[index % colors.length]] || "#6B7280"} 0 ${percentage}%`;
                                })
                                .join(", ")})`,
                        }}
                    >
                        <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-inner">
                            <div className="text-center">
                                <div className="text-xl font-bold text-gray-800">
                                    {total}
                                </div>
                                <div className="text-xs text-gray-500">
                                    총계
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    {entries.map(([key, value], index) => (
                        <div
                            key={key}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center">
                                <div
                                    className={`w-4 h-4 rounded-full ${colors[index % colors.length]} mr-3`}
                                ></div>
                                <span className="text-sm font-medium text-gray-700">
                                    {key}
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-gray-800">
                                    {((value / total) * 100).toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-500">
                                    {value}명
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative bg-white rounded-lg shadow-xl transform transition-all w-full max-w-[95vw] sm:max-w-6xl h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden">
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                                사용자 인사이트 대시보드
                            </h2>
                            <p className="text-blue-100 text-xs sm:text-sm mt-1">
                                총 {users.length}명의 사용자 데이터 분석
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-600 bg-white opacity-50 hover:text-gray-900 transition-colors ml-4 flex-shrink-0"
                        >
                            <svg
                                className="w-5 h-5 sm:w-6 sm:h-6"
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
                </div>

                {/* 탭 네비게이션 */}
                <div className="border-b border-gray-200 flex-shrink-0 overflow-x-auto">
                    <nav className="flex px-4 sm:px-6 min-w-max sm:min-w-0">
                        {[
                            { key: "overview", label: "개요", icon: "📊" },
                            {
                                key: "demographics",
                                label: "인구통계",
                                icon: "👥",
                            },
                            { key: "mbti", label: "MBTI 분석", icon: "🧠" },
                            { key: "trends", label: "트렌드", icon: "📈" },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 mr-2 mt-0.5 mb-0.5 bg-white transition-colors whitespace-nowrap ${
                                    activeTab === tab.key
                                        ? "border-blue-500 text-blue-600"
                                        : "border-gray-400 text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                <span className="mr-1 sm:mr-2">{tab.icon}</span>
                                <span className="hidden sm:inline">
                                    {tab.label}
                                </span>
                                <span className="sm:hidden">
                                    {tab.label.slice(0, 2)}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* 컨텐츠 영역 */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                    {activeTab === "overview" && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* 주요 인사이트 */}
                            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-lg border border-blue-200">
                                    <h3 className="font-semibold text-blue-800 mb-3 sm:mb-4 flex items-center text-base sm:text-lg">
                                        <span className="mr-2">💡</span>
                                        주요 인사이트
                                    </h3>
                                    <ul className="space-y-2 sm:space-y-3">
                                        {insightData.insights.map(
                                            (insight, index) => (
                                                <li
                                                    key={index}
                                                    className="text-xs sm:text-sm text-blue-700 flex items-start"
                                                >
                                                    <span className="mr-2 mt-1 flex-shrink-0">
                                                        •
                                                    </span>
                                                    <span>{insight}</span>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-lg border border-green-200">
                                    <h3 className="font-semibold text-green-800 mb-3 sm:mb-4 flex items-center text-base sm:text-lg">
                                        <span className="mr-2">🎯</span>
                                        추천사항
                                    </h3>
                                    <ul className="space-y-2 sm:space-y-3">
                                        {insightData.recommendations.length >
                                        0 ? (
                                            insightData.recommendations.map(
                                                (rec, index) => (
                                                    <li
                                                        key={index}
                                                        className="text-xs sm:text-sm text-green-700 flex items-start"
                                                    >
                                                        <span className="mr-2 mt-1 flex-shrink-0">
                                                            •
                                                        </span>
                                                        <span>{rec}</span>
                                                    </li>
                                                )
                                            )
                                        ) : (
                                            <li className="text-xs sm:text-sm text-green-700">
                                                현재 사용자 분포가 양호합니다!
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* 요약 통계 */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                                <div className="bg-white p-3 sm:p-6 rounded-lg border text-center shadow-sm">
                                    <div className="text-xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">
                                        {users.length}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-600">
                                        총 사용자
                                    </div>
                                </div>
                                <div className="bg-white p-3 sm:p-6 rounded-lg border text-center shadow-sm">
                                    <div className="text-xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
                                        {
                                            Object.keys(
                                                insightData.mbtiDistribution
                                            ).length
                                        }
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-600">
                                        MBTI 유형
                                    </div>
                                </div>
                                <div className="bg-white p-3 sm:p-6 rounded-lg border text-center shadow-sm">
                                    <div className="text-xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">
                                        {Math.round(
                                            users.reduce(
                                                (sum, user) =>
                                                    sum +
                                                    (new Date().getFullYear() -
                                                        user.birth_year),
                                                0
                                            ) / users.length
                                        )}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-600">
                                        평균 연령
                                    </div>
                                </div>
                                <div className="bg-white p-3 sm:p-6 rounded-lg border text-center shadow-sm">
                                    <div className="text-xl sm:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">
                                        {insightData.roleDistribution[
                                            "관리자"
                                        ] || 0}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-600">
                                        관리자
                                    </div>
                                </div>
                            </div>

                            {/* 추가 상세 분석 */}
                            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                                <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
                                    <h4 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-base sm:text-lg">
                                        📊 연령 분포 분석
                                    </h4>
                                    <div className="space-y-2 sm:space-y-3">
                                        {Object.entries(
                                            insightData.ageDistribution
                                        ).map(([age, count]) => (
                                            <div
                                                key={age}
                                                className="flex justify-between items-center"
                                            >
                                                <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0 min-w-0 mr-2">
                                                    {age}
                                                </span>
                                                <div className="flex items-center flex-1 min-w-0">
                                                    <div className="w-12 sm:w-20 bg-gray-200 rounded-full h-2 mr-2 sm:mr-3 flex-shrink-0">
                                                        <div
                                                            className="bg-blue-500 h-2 rounded-full"
                                                            style={{
                                                                width: `${(count / users.length) * 100}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs sm:text-sm font-medium text-right flex-shrink-0">
                                                        {count}명 (
                                                        {(
                                                            (count /
                                                                users.length) *
                                                            100
                                                        ).toFixed(1)}
                                                        %)
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
                                    <h4 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-base sm:text-lg">
                                        🧠 MBTI 성향 분석
                                    </h4>
                                    <div className="space-y-2 sm:space-y-3">
                                        {Object.entries(
                                            insightData.mbtiGroups
                                        ).map(([group, count]) => (
                                            <div
                                                key={group}
                                                className="flex justify-between items-center"
                                            >
                                                <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0 min-w-0 mr-2">
                                                    {group}
                                                </span>
                                                <div className="flex items-center flex-1 min-w-0">
                                                    <div className="w-12 sm:w-20 bg-gray-200 rounded-full h-2 mr-2 sm:mr-3 flex-shrink-0">
                                                        <div
                                                            className="bg-purple-500 h-2 rounded-full"
                                                            style={{
                                                                width: `${(count / users.length) * 100}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs sm:text-sm font-medium text-right flex-shrink-0">
                                                        {count}명 (
                                                        {(
                                                            (count /
                                                                users.length) *
                                                            100
                                                        ).toFixed(1)}
                                                        %)
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 다른 탭들도 동일한 패턴으로 모바일 최적화 적용 */}
                    {activeTab === "demographics" && (
                        <div className="grid grid-cols-1 gap-4 sm:gap-8 lg:grid-cols-2">
                            <BarChart
                                data={insightData.ageDistribution}
                                title="연령대별 분포"
                            />
                            <PieChart
                                data={insightData.genderDistribution}
                                title="성별 분포"
                            />
                            <BarChart
                                data={insightData.roleDistribution}
                                title="역할별 분포"
                            />

                            {/* 추가 인구통계 분석 */}
                            <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
                                <h4 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-base sm:text-lg">
                                    👥 인구통계 요약
                                </h4>
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                                        <div className="text-xs sm:text-sm text-blue-600 font-medium">
                                            연령대 다양성
                                        </div>
                                        <div className="text-base sm:text-lg font-bold text-blue-800">
                                            {
                                                Object.keys(
                                                    insightData.ageDistribution
                                                ).length
                                            }
                                            개 연령대
                                        </div>
                                        <div className="text-xs text-blue-600 mt-1">
                                            가장 많은:{" "}
                                            {
                                                Object.entries(
                                                    insightData.ageDistribution
                                                ).reduce((a, b) =>
                                                    a[1] > b[1] ? a : b
                                                )[0]
                                            }
                                        </div>
                                    </div>

                                    <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                                        <div className="text-xs sm:text-sm text-green-600 font-medium">
                                            성별 균형도
                                        </div>
                                        <div className="text-base sm:text-lg font-bold text-green-800">
                                            {Math.abs(
                                                50 -
                                                    ((insightData
                                                        .genderDistribution[
                                                        "남성"
                                                    ] || 0) /
                                                        users.length) *
                                                        100
                                            ).toFixed(1)}
                                            % 편차
                                        </div>
                                        <div className="text-xs text-green-600 mt-1">
                                            완전균형(50:50) 기준
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MBTI 탭과 트렌드 탭도 유사하게 반응형 적용 */}
                    {activeTab === "mbti" && (
                        <div className="space-y-6 sm:space-y-8">
                            <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
                                <BarChart
                                    data={insightData.mbtiDistribution}
                                    title="MBTI 유형별 분포"
                                />
                                <PieChart
                                    data={insightData.mbtiGroups}
                                    title="MBTI 그룹별 분포"
                                />
                            </div>
                            {/* MBTI 상세 분석 내용들... */}
                        </div>
                    )}

                    {activeTab === "trends" && (
                        <div className="space-y-6 sm:space-y-8">
                            <BarChart
                                data={insightData.registrationTrends}
                                title="최근 6개월 가입 추세"
                            />
                            {/* 나머지 트렌드 분석 내용들... */}
                        </div>
                    )}
                </div>

                {/* 푸터 */}
                <div className="bg-gray-50 px-4 sm:px-6 py-2 sm:py-3 border-t border-gray-200 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="text-xs sm:text-sm text-gray-500 truncate">
                            데이터 업데이트:{" "}
                            {new Date().toLocaleString("ko-KR")}
                        </div>
                        <button
                            onClick={onClose}
                            className="px-3 sm:px-4 py-1 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium ml-2 flex-shrink-0"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserInsightDashboard;
