import React, { useMemo, useState } from "react";
import {
    X,
    TrendingUp,
    Users,
    AlertTriangle,
    MapPin,
    Clock,
    Car,
    Construction,
    Flame,
    Hospital,
    Mic,
} from "lucide-react";
import { CombinedAreaData, AccidentData } from "../../data/adminData";

interface AdminInsightProps {
    combinedAreaData: CombinedAreaData[];
    accidentData: AccidentData[];
    isVisible: boolean;
    onClose: () => void;
}

interface InsightData {
    totalAreas: number;
    congestionSummary: { [key: string]: number };
    avgPopulation: number;
    totalAccidents: number;
    accidentTypes: { [key: string]: number };
    weatherSummary: {
        avgTemp: number;
        minTemp: number;
        maxTemp: number;
        avgPM10: number;
        avgPM25: number;
    };
    topCrowdedAreas: Array<{
        name: string;
        level: string;
        population: number;
    }>;
    recentAccidents: AccidentData[];
    insights: string[];
    recommendations: string[];
}

const AdminInsight: React.FC<AdminInsightProps> = ({
    combinedAreaData,
    accidentData,
    isVisible,
    onClose,
}) => {
    const [activeTab, setActiveTab] = useState<
        "overview" | "congestion" | "safety" | "weather"
    >("overview");

    // 실제 데이터를 사용한 인사이트 데이터 계산
    const insightData = useMemo<InsightData>(() => {
        if (!combinedAreaData.length) {
            return {
                totalAreas: 0,
                congestionSummary: {},
                avgPopulation: 0,
                totalAccidents: 0,
                accidentTypes: {},
                weatherSummary: {
                    avgTemp: 0,
                    minTemp: 0,
                    maxTemp: 0,
                    avgPM10: 0,
                    avgPM25: 0,
                },
                topCrowdedAreas: [],
                recentAccidents: [],
                insights: [],
                recommendations: [],
            };
        }

        // 혼잡도 분석
        const congestionSummary: { [key: string]: number } = {};
        let totalPopulation = 0;
        let populationCount = 0;

        combinedAreaData.forEach((area) => {
            if (area.population) {
                const level = area.population.area_congest_lvl;
                congestionSummary[level] = (congestionSummary[level] || 0) + 1;

                const avgPop =
                    (area.population.area_ppltn_min +
                        area.population.area_ppltn_max) /
                    2;
                totalPopulation += avgPop;
                populationCount++;
            }
        });

        // 사고 유형 분석
        const accidentTypes: { [key: string]: number } = {};
        accidentData.forEach((accident) => {
            accidentTypes[accident.acdnt_type] =
                (accidentTypes[accident.acdnt_type] || 0) + 1;
        });

        // 날씨 분석
        const weatherData = combinedAreaData
            .map((area) => area.weather)
            .filter((weather) => weather !== null);

        const weatherSummary = {
            avgTemp:
                weatherData.length > 0
                    ? weatherData.reduce((sum, w) => sum + w!.temp, 0) /
                      weatherData.length
                    : 0,
            minTemp:
                weatherData.length > 0
                    ? Math.min(...weatherData.map((w) => w!.min_temp))
                    : 0,
            maxTemp:
                weatherData.length > 0
                    ? Math.max(...weatherData.map((w) => w!.max_temp))
                    : 0,
            avgPM10:
                weatherData.length > 0
                    ? weatherData.reduce((sum, w) => sum + w!.pm10, 0) /
                      weatherData.length
                    : 0,
            avgPM25:
                weatherData.length > 0
                    ? weatherData.reduce((sum, w) => sum + w!.pm25, 0) /
                      weatherData.length
                    : 0,
        };

        // 혼잡한 지역 TOP 5
        const topCrowdedAreas = combinedAreaData
            .filter((area) => area.population)
            .map((area) => ({
                name: area.area_nm,
                level: area.population!.area_congest_lvl,
                population:
                    (area.population!.area_ppltn_min +
                        area.population!.area_ppltn_max) /
                    2,
            }))
            .sort((a, b) => {
                const order = { 붐빔: 4, "약간 붐빔": 3, 보통: 2, 여유: 1 };
                const aOrder = order[a.level as keyof typeof order] || 0;
                const bOrder = order[b.level as keyof typeof order] || 0;
                if (aOrder !== bOrder) return bOrder - aOrder;
                return b.population - a.population;
            })
            .slice(0, 5);

        // 최근 사고 (최대 5개)
        const recentAccidents = accidentData
            .sort(
                (a, b) =>
                    new Date(b.acdnt_occr_dt).getTime() -
                    new Date(a.acdnt_occr_dt).getTime()
            )
            .slice(0, 5);

        // 인사이트 생성
        const insights: string[] = [];
        const recommendations: string[] = [];

        // 혼잡도 인사이트
        if (Object.keys(congestionSummary).length > 0) {
            const mostCongestionLevel = Object.entries(
                congestionSummary
            ).reduce((a, b) => (a[1] > b[1] ? a : b));
            insights.push(
                `전체 ${combinedAreaData.length}개 지역 중 ${mostCongestionLevel[1]}곳이 '${mostCongestionLevel[0]}' 상태입니다`
            );

            const crowdedAreas =
                (congestionSummary["붐빔"] || 0) +
                (congestionSummary["약간 붐빔"] || 0);
            if (crowdedAreas > combinedAreaData.length * 0.3) {
                insights.push(
                    `전체 지역의 ${((crowdedAreas / combinedAreaData.length) * 100).toFixed(1)}%가 혼잡한 상태입니다`
                );
                recommendations.push(
                    "혼잡 지역에 대한 분산 정책이나 교통 개선이 필요합니다"
                );
            }
        }

        // 사고 인사이트
        if (accidentData.length > 0) {
            const mostAccidentType = Object.entries(accidentTypes).reduce(
                (a, b) => (a[1] > b[1] ? a : b)
            );
            insights.push(
                `가장 빈번한 사고 유형은 '${mostAccidentType[0]}'입니다 (${mostAccidentType[1]}건)`
            );

            if (
                accidentTypes["교통사고"] &&
                accidentTypes["교통사고"] > accidentData.length * 0.4
            ) {
                recommendations.push(
                    "교통사고 발생률이 높으므로 교통안전 대책 강화가 필요합니다"
                );
            }
        }

        // 날씨/환경 인사이트
        if (weatherSummary.avgPM10 > 80) {
            insights.push(
                `평균 미세먼지 농도가 ${weatherSummary.avgPM10.toFixed(1)}㎍/㎥로 나쁨 수준입니다`
            );
            recommendations.push(
                "미세먼지 주의보 발령 및 관광객 안내가 필요합니다"
            );
        }

        if (weatherSummary.avgTemp > 30) {
            insights.push(
                `평균 기온이 ${weatherSummary.avgTemp.toFixed(1)}°C로 매우 높습니다`
            );
            recommendations.push(
                "폭염 대비 시설 점검 및 관광객 안전 관리가 필요합니다"
            );
        }

        return {
            totalAreas: combinedAreaData.length,
            congestionSummary,
            avgPopulation:
                populationCount > 0 ? totalPopulation / populationCount : 0,
            totalAccidents: accidentData.length,
            accidentTypes,
            weatherSummary,
            topCrowdedAreas,
            recentAccidents,
            insights,
            recommendations,
        };
    }, [combinedAreaData, accidentData]);

    // 혼잡도 색상 반환
    const getCongestionColor = (level: string): string => {
        switch (level) {
            case "여유":
                return "text-green-600 bg-green-100";
            case "보통":
                return "text-yellow-600 bg-yellow-100";
            case "약간 붐빔":
                return "text-orange-600 bg-orange-100";
            case "붐빔":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    // 사고 유형 아이콘
    const getAccidentIcon = (type: string) => {
        switch (type) {
            case "교통사고":
                return <Car size={16} color="#F97316" />; // orange-500
            case "화재":
                return <Flame size={16} color="#EF4444" />; // red-500
            case "의료":
                return <Hospital size={16} color="#3B82F6" />; // blue-500
            case "공사":
                return <Construction size={16} color="#EAB308" />; // yellow-500
            case "낙하물":
                return <AlertTriangle size={16} color="#A855F7" />; // purple-500
            case "집회및행사":
                return <Mic size={16} color="#22C55E" />; // green-500
            case "기타":
                return <MapPin size={16} color="#6B7280" />; // gray-500
            default:
                return <MapPin size={16} color="#6B7280" />; // gray-500
        }
    };

    // 미세먼지 상태
    const getPMStatus = (
        value: number,
        type: "PM10" | "PM25"
    ): { text: string; color: string } => {
        if (type === "PM10") {
            if (value <= 30) return { text: "좋음", color: "text-green-600" };
            if (value <= 80) return { text: "보통", color: "text-yellow-600" };
            if (value <= 150) return { text: "나쁨", color: "text-orange-600" };
            return { text: "매우나쁨", color: "text-red-600" };
        } else {
            if (value <= 15) return { text: "좋음", color: "text-green-600" };
            if (value <= 35) return { text: "보통", color: "text-yellow-600" };
            if (value <= 75) return { text: "나쁨", color: "text-orange-600" };
            return { text: "매우나쁨", color: "text-red-600" };
        }
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
                                관광특구 통합 인사이트
                            </h2>
                            <p className="text-blue-100 text-xs sm:text-sm mt-1">
                                전체 {insightData.totalAreas}개 관광특구 현황
                                분석
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 bg-white opacity-50 hover:text-gray-700 transition-colors ml-4 flex-shrink-0"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="border-b border-gray-200 flex-shrink-0 overflow-x-auto">
                    <nav className="flex px-4 sm:px-6 min-w-max sm:min-w-0 m-2">
                        {[
                            {
                                key: "overview",
                                label: "전체 개요",
                                icon: <TrendingUp className="w-4 h-4" />,
                            },
                            {
                                key: "congestion",
                                label: "혼잡도",
                                icon: <Users className="w-4 h-4" />,
                            },
                            {
                                key: "safety",
                                label: "안전",
                                icon: <AlertTriangle className="w-4 h-4" />,
                            },
                            {
                                key: "weather",
                                label: "날씨/환경",
                                icon: <Clock className="w-4 h-4" />,
                            },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`text-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 mr-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                                    activeTab === tab.key
                                        ? "border-blue-500 bg-indigo-600"
                                        : "border-transparent bg-indigo-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* 컨텐츠 영역 */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                    {activeTab === "overview" && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* 주요 지표 */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                                    <div className="text-lg sm:text-2xl font-bold text-blue-600">
                                        {insightData.totalAreas}
                                    </div>
                                    <div className="text-xs sm:text-sm text-blue-800">
                                        총 관광특구
                                    </div>
                                </div>
                                <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
                                    <div className="text-lg sm:text-2xl font-bold text-green-600">
                                        {Math.round(
                                            insightData.avgPopulation
                                        ).toLocaleString()}
                                    </div>
                                    <div className="text-xs sm:text-sm text-green-800">
                                        평균 인구수
                                    </div>
                                </div>
                                <div className="bg-red-50 p-3 sm:p-4 rounded-lg border border-red-200">
                                    <div className="text-lg sm:text-2xl font-bold text-red-600">
                                        {insightData.totalAccidents}
                                    </div>
                                    <div className="text-xs sm:text-sm text-red-800">
                                        총 사고 건수
                                    </div>
                                </div>
                                <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-200">
                                    <div className="text-lg sm:text-2xl font-bold text-purple-600">
                                        {Math.round(
                                            insightData.weatherSummary.avgTemp
                                        )}
                                        °C
                                    </div>
                                    <div className="text-xs sm:text-sm text-purple-800">
                                        평균 기온
                                    </div>
                                </div>
                            </div>

                            {/* 주요 인사이트 및 권장사항 */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-lg border border-blue-200">
                                    <h3 className="font-semibold text-blue-800 mb-3 sm:mb-4 flex items-center text-base sm:text-lg">
                                        <TrendingUp className="w-5 h-5 mr-2" />
                                        주요 인사이트
                                    </h3>
                                    <ul className="space-y-2 sm:space-y-3">
                                        {insightData.insights.length > 0 ? (
                                            insightData.insights.map(
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
                                            )
                                        ) : (
                                            <li className="text-xs sm:text-sm text-blue-700">
                                                데이터 분석 중입니다...
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-6 rounded-lg border border-orange-200">
                                    <h3 className="font-semibold text-orange-800 mb-3 sm:mb-4 flex items-center text-base sm:text-lg">
                                        <AlertTriangle className="w-5 h-5 mr-2" />
                                        관리 권장사항
                                    </h3>
                                    <ul className="space-y-2 sm:space-y-3">
                                        {insightData.recommendations.length >
                                        0 ? (
                                            insightData.recommendations.map(
                                                (rec, index) => (
                                                    <li
                                                        key={index}
                                                        className="text-xs sm:text-sm text-orange-700 flex items-start"
                                                    >
                                                        <span className="mr-2 mt-1 flex-shrink-0">
                                                            •
                                                        </span>
                                                        <span>{rec}</span>
                                                    </li>
                                                )
                                            )
                                        ) : (
                                            <li className="text-xs sm:text-sm text-orange-700">
                                                현재 특별한 관리 이슈가
                                                없습니다.
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* 혼잡 지역 TOP 5 */}
                            <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center text-base sm:text-lg">
                                    <MapPin className="w-5 h-5 mr-2" />
                                    혼잡도 상위 지역
                                </h3>
                                <div className="space-y-3">
                                    {insightData.topCrowdedAreas.length > 0 ? (
                                        insightData.topCrowdedAreas.map(
                                            (area, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                >
                                                    <div className="flex items-center">
                                                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                                                            {index + 1}
                                                        </span>
                                                        <span className="font-medium text-gray-900 text-sm">
                                                            {area.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-600">
                                                            {Math.round(
                                                                area.population
                                                            ).toLocaleString()}
                                                            명
                                                        </span>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getCongestionColor(area.level)}`}
                                                        >
                                                            {area.level}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        )
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p className="text-sm">
                                                혼잡도 데이터가 없습니다.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "congestion" && (
                        <div className="space-y-6">
                            {Object.keys(insightData.congestionSummary).length >
                            0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {Object.entries(
                                        insightData.congestionSummary
                                    ).map(([level, count]) => (
                                        <div
                                            key={level}
                                            className="bg-white p-4 rounded-lg border border-gray-200 text-center"
                                        >
                                            <div
                                                className={`text-2xl font-bold mb-2 ${getCongestionColor(level).split(" ")[0]}`}
                                            >
                                                {count}
                                            </div>
                                            <div
                                                className={`text-sm px-2 py-1 rounded-full ${getCongestionColor(level)}`}
                                            >
                                                {level}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-2">
                                                {(
                                                    (count /
                                                        insightData.totalAreas) *
                                                    100
                                                ).toFixed(1)}
                                                %
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="mb-4">
                                        <Users className="w-16 h-16 mx-auto text-gray-300" />
                                    </div>
                                    <p className="text-lg font-medium">
                                        혼잡도 데이터가 없습니다
                                    </p>
                                    <p className="text-sm mt-2">
                                        데이터를 불러오는 중이거나 아직 수집되지
                                        않았습니다.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "safety" && (
                        <div className="space-y-6">
                            {Object.keys(insightData.accidentTypes).length >
                            0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                                        <h4 className="font-semibold text-gray-800 mb-4">
                                            사고 유형별 통계
                                        </h4>
                                        <div className="space-y-3">
                                            {Object.entries(
                                                insightData.accidentTypes
                                            ).map(([type, count]) => (
                                                <div
                                                    key={type}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex items-center">
                                                        <span className="text-lg mr-2">
                                                            {getAccidentIcon(
                                                                type
                                                            )}
                                                        </span>
                                                        <span className="text-black text-sm font-medium">
                                                            {type}
                                                        </span>
                                                    </div>
                                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                                                        {count}건
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                                        <h4 className="font-semibold text-gray-800 mb-4">
                                            최근 발생 사고
                                        </h4>
                                        <div className="space-y-3">
                                            {insightData.recentAccidents
                                                .length > 0 ? (
                                                insightData.recentAccidents.map(
                                                    (accident, index) => (
                                                        <div
                                                            key={index}
                                                            className="p-3 bg-red-50 rounded-lg border border-red-200"
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="font-medium text-red-800 text-sm">
                                                                    {
                                                                        accident.area_nm
                                                                    }
                                                                </span>
                                                                <span className="text-xs text-red-600">
                                                                    {new Date(
                                                                        accident.acdnt_occr_dt
                                                                    ).toLocaleDateString(
                                                                        "ko-KR"
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-700 line-clamp-2">
                                                                {
                                                                    accident.acdnt_info
                                                                }
                                                            </p>
                                                            <div className="mt-2 flex items-center text-xs text-gray-500">
                                                                <span className="mr-2">
                                                                    {getAccidentIcon(
                                                                        accident.acdnt_type
                                                                    )}
                                                                </span>
                                                                <span>
                                                                    {
                                                                        accident.acdnt_type
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                )
                                            ) : (
                                                <div className="text-center py-4 text-gray-500">
                                                    <p className="text-sm">
                                                        최근 사고 정보가
                                                        없습니다.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="mb-4">
                                        <AlertTriangle className="w-16 h-16 mx-auto text-gray-300" />
                                    </div>
                                    <p className="text-lg font-medium">
                                        사고 데이터가 없습니다
                                    </p>
                                    <p className="text-sm mt-2">
                                        현재 등록된 사고 정보가 없거나 데이터를
                                        불러오는 중입니다.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "weather" && (
                        <div className="space-y-6">
                            {insightData.weatherSummary.avgTemp > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-center">
                                        <div className="text-2xl font-bold text-orange-600 mb-2">
                                            {Math.round(
                                                insightData.weatherSummary
                                                    .avgTemp
                                            )}
                                            °C
                                        </div>
                                        <div className="text-sm text-orange-800">
                                            평균기온
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                                        <div className="text-2xl font-bold text-blue-600 mb-2">
                                            {Math.round(
                                                insightData.weatherSummary
                                                    .minTemp
                                            )}
                                            °C
                                        </div>
                                        <div className="text-sm text-blue-800">
                                            최저기온
                                        </div>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                                        <div className="text-2xl font-bold text-red-600 mb-2">
                                            {Math.round(
                                                insightData.weatherSummary
                                                    .maxTemp
                                            )}
                                            °C
                                        </div>
                                        <div className="text-sm text-red-800">
                                            최고기온
                                        </div>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                                        <div className="text-lg font-bold text-green-600 mb-2">
                                            {Math.round(
                                                insightData.weatherSummary
                                                    .avgPM10
                                            )}
                                        </div>
                                        <div className="text-xs text-green-800">
                                            평균 미세먼지
                                        </div>
                                        <div
                                            className={`text-xs mt-1 ${getPMStatus(insightData.weatherSummary.avgPM10, "PM10").color}`}
                                        >
                                            {
                                                getPMStatus(
                                                    insightData.weatherSummary
                                                        .avgPM10,
                                                    "PM10"
                                                ).text
                                            }
                                        </div>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                                        <div className="text-lg font-bold text-purple-600 mb-2">
                                            {Math.round(
                                                insightData.weatherSummary
                                                    .avgPM25
                                            )}
                                        </div>
                                        <div className="text-xs text-purple-800">
                                            평균 초미세먼지
                                        </div>
                                        <div
                                            className={`text-xs mt-1 ${getPMStatus(insightData.weatherSummary.avgPM25, "PM25").color}`}
                                        >
                                            {
                                                getPMStatus(
                                                    insightData.weatherSummary
                                                        .avgPM25,
                                                    "PM25"
                                                ).text
                                            }
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="mb-4">
                                        <Clock className="w-16 h-16 mx-auto text-gray-300" />
                                    </div>
                                    <p className="text-lg font-medium">
                                        날씨 데이터가 없습니다
                                    </p>
                                    <p className="text-sm mt-2">
                                        날씨 정보를 불러오는 중이거나 아직
                                        수집되지 않았습니다.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 푸터 */}
                <div className="bg-gray-50 px-4 sm:px-6 py-2 sm:py-3 border-t border-gray-200 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="text-xs sm:text-sm text-gray-500">
                            마지막 업데이트:{" "}
                            {new Date().toLocaleString("ko-KR")}
                        </div>
                        <button
                            onClick={onClose}
                            className="px-3 sm:px-4 py-1 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-xs sm:text-sm font-medium"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminInsight;
