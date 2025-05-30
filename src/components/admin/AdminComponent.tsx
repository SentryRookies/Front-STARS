import { useNavigate } from "react-router-dom";
import { useAdminData } from "../../context/AdminContext";
import SpotCard from "./cards/SpotCard";
import AdminHeader from "./AdminHeader";
import CongestionTag from "./cards/CongestionTag";
import React, { useState, useEffect } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import AdminInsight from "./AdminComponentInsight";

// 타입 가져오기
import {
    CombinedAreaData,
    TouristSpot,
    AccidentData,
} from "../../data/adminData";
import AccidentCard from "./cards/AccidentCard";

export default function AdminComponent() {
    const navigate = useNavigate();
    const [sortField, setSortField] = useState<string>("spotName");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [isInsightModalOpen, setIsInsightModalOpen] =
        useState<boolean>(false);

    const isMobile = useMediaQuery("(max-width: 768px)");

    const {
        touristSpotsData,
        accidentData,
        combinedAreaData,
        isLoading,
        error,
        refreshAllData,
    } = useAdminData();

    const [localTouristSpotsData, setLocalTouristSpotsData] = useState<
        TouristSpot[]
    >([]);

    useEffect(() => {
        if (touristSpotsData && touristSpotsData.length > 0) {
            setLocalTouristSpotsData((prevData) => {
                if (prevData.length === 0) {
                    return [...touristSpotsData];
                }

                const updatedData = [...prevData];
                touristSpotsData.forEach((newSpot) => {
                    const existingIndex = updatedData.findIndex(
                        (spot) => spot.area_nm === newSpot.area_nm
                    );

                    if (existingIndex >= 0) {
                        updatedData[existingIndex] = {
                            ...updatedData[existingIndex],
                            ...newSpot,
                        };
                    } else {
                        updatedData.push(newSpot);
                    }
                });

                return updatedData;
            });
        }
    }, [touristSpotsData]);

    const congestionOrder = {
        여유: 1,
        보통: 2,
        "약간 붐빔": 3,
        붐빔: 4,
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const renderSortIcon = (field: string) => {
        if (sortField !== field) return null;
        return sortDirection === "asc" ? (
            <span className="ml-1 text-blue-500">↑</span>
        ) : (
            <span className="ml-1 text-blue-500">↓</span>
        );
    };

    const sortedTouristInfo: CombinedAreaData[] = [...combinedAreaData].sort(
        (a, b) => {
            if (sortField === "spotName") {
                return sortDirection === "asc"
                    ? a.area_nm.localeCompare(b.area_nm)
                    : b.area_nm.localeCompare(a.area_nm);
            }

            if (sortField === "congestion") {
                const valueA = a?.population?.area_congest_lvl
                    ? congestionOrder[
                          a.population
                              .area_congest_lvl as keyof typeof congestionOrder
                      ] || 0
                    : 0;

                const valueB = b?.population?.area_congest_lvl
                    ? congestionOrder[
                          b.population
                              .area_congest_lvl as keyof typeof congestionOrder
                      ] || 0
                    : 0;

                return sortDirection === "asc"
                    ? valueA - valueB
                    : valueB - valueA;
            }

            return 0;
        }
    );

    const handleSpotClick = (info: CombinedAreaData) => {
        window.scrollTo(0, 0);
        navigate(`/manage/${info.area_id}`, {
            state: {
                combinedAreaData: info,
            },
        });
    };

    const handleAccidentClick = (accident: AccidentData) => {
        const accidentLocation = accident.area_nm;
        const matchedArea = combinedAreaData.find(
            (area) => area.area_nm === accidentLocation
        );

        if (matchedArea) {
            handleSpotClick(matchedArea);
        } else {
            alert(`관련 지역 정보를 찾을 수 없습니다: ${accidentLocation}`);
        }
    };

    // 인사이트 모달 열기/닫기 핸들러
    const handleInsightModalOpen = () => {
        setIsInsightModalOpen(true);
    };

    const handleInsightModalClose = () => {
        setIsInsightModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Modern Header */}
            <AdminHeader path={"/map"} />

            {/* Error Alert - Compact */}
            {error && (
                <div className="mx-3 mt-2 p-2 bg-red-50 border-l-4 border-red-400 rounded-r-lg shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <svg
                                className="h-4 w-4 text-red-400 mr-2"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <p className="text-xs text-red-800">
                                <span className="font-medium">오류!</span>{" "}
                                {error}
                            </p>
                        </div>
                        <button
                            onClick={() => refreshAllData()}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                        >
                            재시도
                        </button>
                    </div>
                </div>
            )}

            {/* 인사이트 버튼 추가 */}
            <div className="pt-3 pr-3 pl-3">
                <div className="">
                    <button
                        onClick={handleInsightModalOpen}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3"
                        disabled={isLoading || combinedAreaData.length === 0}
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
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                        <span
                            className={`${isMobile ? "text-base" : "text-lg"}`}
                        >
                            {isMobile
                                ? "통합 인사이트"
                                : "관광특구 통합 인사이트 보기"}
                        </span>
                        <span className="bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full">
                            {combinedAreaData.length}곳 분석
                        </span>
                    </button>
                </div>
            </div>

            {/* Main Content Grid - Compact */}
            <div className="p-3 space-y-3">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    {/* Congestion Status Card - Compact */}
                    <div className="lg:col-span-1 bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="p-1 bg-white/20 rounded">
                                        <svg
                                            className="w-4 h-4 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-white font-semibold text-sm">
                                            인구 혼잡 현황
                                        </h2>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <span className="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                                        {localTouristSpotsData.length}곳
                                    </span>
                                    {isLoading && (
                                        <svg
                                            className="animate-spin h-3 w-3 text-white"
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
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-2 md:h-[84vh] h-[40vh] overflow-y-auto">
                            <div className="space-y-2">
                                {isLoading && touristSpotsData.length === 0 ? (
                                    [...Array(4)].map((_, idx) => (
                                        <div
                                            key={idx}
                                            className="animate-pulse"
                                        >
                                            <div className="p-2 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                    <div className="h-4 bg-gray-200 rounded-full w-12"></div>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1"></div>
                                                <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                                            </div>
                                        </div>
                                    ))
                                ) : localTouristSpotsData.length > 0 ? (
                                    localTouristSpotsData.map((spot, idx) => (
                                        <div
                                            key={idx}
                                            className="transform transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                                            onClick={() => {
                                                const areaData =
                                                    combinedAreaData.find(
                                                        (area) =>
                                                            area.area_nm ===
                                                            spot.area_nm
                                                    );
                                                if (areaData) {
                                                    window.scrollTo(0, 0);
                                                    navigate(
                                                        `/manage/${areaData.area_id}`,
                                                        {
                                                            state: {
                                                                combinedAreaData:
                                                                    areaData,
                                                            },
                                                        }
                                                    );
                                                }
                                            }}
                                        >
                                            <SpotCard {...spot} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                        <svg
                                            className="w-8 h-8 mb-2 text-gray-300"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                            />
                                        </svg>
                                        <p className="text-xs">
                                            혼잡 현황 없음
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Compact */}
                    <div className="lg:col-span-2 space-y-3">
                        {/* Accident Information Card - Compact */}
                        {/* Accident Information Card - Compact */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 overflow-hidden">
                            <div className="bg-gradient-to-r from-red-500 to-pink-500 px-3 py-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-1 bg-white/20 rounded">
                                            <svg
                                                className="w-4 h-4 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"
                                                />
                                            </svg>
                                        </div>
                                        <h2 className="text-white font-semibold text-sm">
                                            사고 정보
                                        </h2>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <span className="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                                            {accidentData.length}건
                                        </span>
                                        {isLoading && (
                                            <svg
                                                className="animate-spin h-3 w-3 text-white"
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
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="md:h-[25vh] h-[40vh]">
                                <AccidentCard
                                    accidentData={accidentData}
                                    isLoading={isLoading}
                                    isMobile={isMobile}
                                    onSelectAccident={handleAccidentClick}
                                />
                            </div>
                        </div>

                        {/* Tourist Spots Table - Compact */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-1 bg-white/20 rounded">
                                            <svg
                                                className="w-4 h-4 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                        </div>
                                        <h2 className="text-white font-semibold text-sm">
                                            전체 관광지 현황
                                        </h2>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <span className="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                                            {combinedAreaData.length}곳
                                        </span>
                                        {isLoading && (
                                            <svg
                                                className="animate-spin h-3 w-3 text-white"
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
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Compact Table Header */}
                            <div
                                className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-4"} gap-2 p-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b font-medium text-xs text-gray-700`}
                            >
                                <div
                                    className="flex items-center justify-center cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={() => handleSort("spotName")}
                                >
                                    관광지명 {renderSortIcon("spotName")}
                                </div>
                                {!isMobile && (
                                    <>
                                        <div className="text-center">코드</div>
                                        <div className="text-center">시간</div>
                                    </>
                                )}
                                <div
                                    className="flex items-center justify-center cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={() => handleSort("congestion")}
                                >
                                    혼잡도 {renderSortIcon("congestion")}
                                </div>
                            </div>

                            {/* Compact Table Content */}
                            <div className="h-[49.5vh] overflow-y-auto">
                                {isLoading && combinedAreaData.length === 0 ? (
                                    [...Array(6)].map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-4"} gap-2 p-2 border-b animate-pulse`}
                                        >
                                            <div className="flex justify-center">
                                                <div className="h-3 bg-gray-200 rounded w-16"></div>
                                            </div>
                                            {!isMobile && (
                                                <>
                                                    <div className="flex justify-center">
                                                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                                                    </div>
                                                    <div className="flex justify-center">
                                                        <div className="h-3 bg-gray-200 rounded w-14"></div>
                                                    </div>
                                                </>
                                            )}
                                            <div className="flex justify-center">
                                                <div className="h-4 bg-gray-200 rounded-full w-12"></div>
                                            </div>
                                        </div>
                                    ))
                                ) : sortedTouristInfo.length > 0 ? (
                                    sortedTouristInfo.map((info, idx) => (
                                        <div
                                            key={idx}
                                            className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-4"} gap-2 p-2 border-b hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer group`}
                                            onClick={() =>
                                                handleSpotClick(info)
                                            }
                                        >
                                            <div className="text-center font-medium text-gray-800 text-xs group-hover:text-blue-600 transition-colors">
                                                {info.area_nm}
                                            </div>
                                            {!isMobile && (
                                                <>
                                                    <div className="text-center text-gray-600 text-xs">
                                                        {info.population
                                                            ?.area_cd || "N/A"}
                                                    </div>
                                                    <div className="text-center text-gray-600 text-xs">
                                                        {info.population
                                                            ?.ppltn_time ||
                                                            "N/A"}
                                                    </div>
                                                </>
                                            )}
                                            <div className="flex justify-center">
                                                <CongestionTag
                                                    level={
                                                        info.population
                                                            ?.area_congest_lvl ||
                                                        "여유"
                                                    }
                                                    size={"sm"}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                        <svg
                                            className="w-8 h-8 mb-2 text-gray-300"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647zm0 0V21h4a2 2 0 002-2v-1.101z"
                                            />
                                        </svg>
                                        <p className="text-xs">
                                            관광지 정보 없음
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AdminInsight 모달 */}
            <AdminInsight
                combinedAreaData={combinedAreaData}
                accidentData={accidentData}
                isVisible={isInsightModalOpen}
                onClose={handleInsightModalClose}
            />
        </div>
    );
}
