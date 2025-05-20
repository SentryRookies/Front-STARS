import { useNavigate } from "react-router-dom";
import { useAdminData } from "../../context/AdminContext";
import SpotCard from "./cards/spotCard";
import AdminHeader from "./AdminHeader";
import CongestionTag from "./cards/CongestionTag";
import { useState } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";

// 타입 가져오기
import { CombinedAreaData } from "../../data/adminData";
import AccidentCard from "./cards/AccidentCard";

export default function AdminComponent() {
    const navigate = useNavigate();
    const [sortField, setSortField] = useState<string>("spotName"); // 기본값: 관광지명
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc"); // 기본값: 오름차순

    // 모바일 화면 감지 (768px 미만일 때 모바일로 간주)
    const isMobile = useMediaQuery("(max-width: 768px)");

    // AdminDataContext에서 데이터 가져오기
    const {
        touristSpotsData, // 혼잡도 3~4단계
        accidentData, // 사고정보
        combinedAreaData, // 관광지 상세정보 + 날씨
        isLoading, // 로딩중
        error,
        refreshAllData, // 모든 SSE 재구독
        // refreshing,
    } = useAdminData();

    // 혼잡도 값에 대한 우선순위 매핑
    const congestionOrder = {
        여유: 1,
        보통: 2,
        "약간 붐빔": 3,
        붐빔: 4,
    };

    // 정렬 함수
    const handleSort = (field: string) => {
        if (sortField === field) {
            // 같은 필드를 클릭하면 방향 전환
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            // 새 필드를 클릭하면 기본 오름차순으로 시작
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const sortedTouristInfo: CombinedAreaData[] = [...combinedAreaData].sort(
        (a, b) => {
            if (sortField === "spotName") {
                return sortDirection === "asc"
                    ? a.area_nm.localeCompare(b.area_nm)
                    : b.area_nm.localeCompare(a.area_nm);
            }

            if (sortField === "congestion") {
                // population이 null일 수 있으므로 체크 필요
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

    // 정렬 표시 아이콘 렌더링 (유니코드 문자 사용)
    const renderSortIcon = (field: string) => {
        if (sortField !== field) return null;

        return sortDirection === "asc" ? (
            <span className="ml-1">▲</span>
        ) : (
            <span className="ml-1">▼</span>
        );
    };

    // 관광지 클릭 핸들러 - 선택한 관광지 정보와 함께 디테일 페이지로 이동
    const handleSpotClick = (info: CombinedAreaData) => {
        // 페이지 이동 전 스크롤 위치 초기화
        window.scrollTo(0, 0);
        console.log(info);

        // 선택한 관광지 정보와 함께 상세 페이지로 이동
        navigate(`/manage/${info.area_id}`, {
            state: {
                combinedAreaData: info,
            },
        });
    };

    // 로딩 스켈레톤 컴포넌트
    const SpotCardSkeleton = () => (
        <div className="p-3 bg-white border rounded-lg shadow-sm animate-pulse">
            <div className="flex justify-between items-center mb-2">
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="w-full bg-gray-200 rounded h-3 mb-2"></div>
            <div className="mt-2 h-5 bg-gray-200 rounded w-1/3"></div>
        </div>
    );

    const AccidentCardSkeleton = () => (
        <div className="p-3 bg-white border rounded-lg shadow-sm animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded-full w-8 mx-auto mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
        </div>
    );

    return (
        <div className="bg-gray-100 flex flex-col w-full h-screen">
            {/* Header */}
            <AdminHeader path={"/map"} />
            {/* End of Header */}

            {/* 오류 메시지 표시 */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 mt-4 relative">
                    <strong className="font-bold">오류 발생!</strong>
                    <span className="block sm:inline"> {error}</span>
                    <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2"
                        onClick={() => refreshAllData()}
                    >
                        재시도
                    </button>
                </div>
            )}

            {/* Main Container - 남은 공간을 모두 차지하도록 flex-1 설정 */}
            <div className="flex-1 flex flex-col lg:flex-row p-2 md:p-4 space-y-4 lg:space-y-0 lg:space-x-4 overflow-hidden">
                {/* 주요 인구 혼잡 현황 섹션 - 왼쪽에 배치 (큰 화면) / 위에 배치 (작은 화면) */}
                <div className="w-full lg:w-1/3 bg-white rounded-lg shadow-md order-1 flex flex-col">
                    <h2 className="text-base md:text-lg lg:text-xl p-3 font-bold text-black border-b flex justify-between items-center">
                        <span className={isMobile ? "text-sm" : ""}>
                            주요 인구 혼잡 현황
                        </span>
                        {isLoading && (
                            <span className="text-xs md:text-sm text-blue-500 font-normal flex items-center">
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-3 w-3 md:h-4 md:w-4 text-blue-500"
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
                                로딩 중
                            </span>
                        )}
                    </h2>
                    <div className="p-2 flex-1 overflow-x-auto lg:overflow-y-auto">
                        <div
                            className="flex flex-nowrap lg:flex-col space-x-3 lg:space-x-0 lg:space-y-3 pb-2"
                            style={{ minWidth: "max-content", width: "100%" }}
                        >
                            {isLoading ? (
                                // 로딩 스켈레톤
                                [...Array(5)].map((_, idx) => (
                                    <div
                                        key={idx}
                                        className="w-60 lg:w-full flex-none"
                                    >
                                        <SpotCardSkeleton />
                                    </div>
                                ))
                            ) : touristSpotsData.length > 0 ? (
                                touristSpotsData.map((spot, idx) => (
                                    <div
                                        key={idx}
                                        className="w-60 lg:w-full flex-none"
                                    >
                                        <SpotCard
                                            key={idx}
                                            {...spot}
                                            onClick={() => {
                                                // Find the corresponding detailed area data
                                                const areaData =
                                                    combinedAreaData.find(
                                                        (area) =>
                                                            area.area_nm ===
                                                            spot.area_nm
                                                    );
                                                if (areaData) {
                                                    // Use the same navigation logic as in the table
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
                                        />
                                    </div>
                                ))
                            ) : (
                                // 데이터 없음
                                <div className="p-4 text-center text-gray-500">
                                    현재 혼잡 현황 데이터가 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 오른쪽 컨텐츠 컨테이너 */}
                <div className="flex-1 flex flex-col w-full lg:w-2/3 space-y-4 order-2 overflow-hidden">
                    {/* 사고 정보 섹션 - 모바일 최적화 수정 */}
                    <div className="w-full border rounded-lg shadow-md bg-white">
                        <h2 className="text-lg md:text-xl p-3 font-bold text-black border-b flex justify-between items-center">
                            <span>사고 정보</span>
                            {isLoading && (
                                <span className="text-sm text-blue-500 font-normal flex items-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
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
                                    로딩 중
                                </span>
                            )}
                        </h2>
                        <div className="p-2 overflow-x-auto">
                            <div
                                className="flex flex-nowrap space-x-3 pb-2"
                                style={{ minWidth: "max-content" }}
                            >
                                {isLoading ? (
                                    // 로딩 스켈레톤
                                    [...Array(5)].map((_, idx) => (
                                        <div
                                            key={idx}
                                            className="w-32 md:w-40 flex-none"
                                        >
                                            <AccidentCardSkeleton />
                                        </div>
                                    ))
                                ) : accidentData.length > 0 ? (
                                    // 실제 데이터 - 모바일 여부 전달
                                    accidentData.map((data, idx) => (
                                        <div
                                            key={idx}
                                            className="w-32 md:w-40 flex-none"
                                        >
                                            <AccidentCard
                                                datas={data}
                                                isMobile={isMobile}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    // 데이터 없음
                                    <div className="p-4 text-center text-gray-500 w-full">
                                        사고 정보가 없거나 불러올 수 없습니다.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 관광지 정보 테이블 - flex-1로 남은 공간 차지 */}
                    <div className="flex-1 w-full bg-white rounded-lg shadow-md overflow-hidden border flex flex-col">
                        <div
                            className="flex bg-gray-100 py-2 md:py-3 border-b font-medium text-sm md:text-lg w-full"
                            style={{ minWidth: isMobile ? "auto" : "650px" }}
                        >
                            <div
                                className={`${isMobile ? "w-2/3" : "w-1/4"} text-center text-black cursor-pointer`}
                                onClick={() => handleSort("spotName")}
                            >
                                관광지명 {renderSortIcon("spotName")}
                            </div>
                            {!isMobile && (
                                <>
                                    <div className="w-1/4 text-center text-black">
                                        코드
                                    </div>
                                    <div className="w-1/4 text-center text-black">
                                        시간
                                    </div>
                                </>
                            )}
                            <div
                                className={`${isMobile ? "w-1/3" : "w-1/4"} text-center text-black cursor-pointer`}
                                onClick={() => handleSort("congestion")}
                            >
                                혼잡도 {renderSortIcon("congestion")}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto overflow-x-hidden">
                            <div
                                style={{
                                    minWidth: isMobile ? "auto" : "650px",
                                }}
                            >
                                {isLoading ? (
                                    // 로딩 스켈레톤 - 모바일 최적화
                                    [...Array(10)].map((_, idx) => (
                                        <div
                                            key={idx}
                                            className="flex py-3 border-b animate-pulse"
                                        >
                                            <div
                                                className={`${isMobile ? "w-2/3" : "w-1/4"} px-1`}
                                            >
                                                <div className="h-4 bg-gray-200 rounded"></div>
                                            </div>
                                            {!isMobile && (
                                                <>
                                                    <div className="w-1/4 px-1">
                                                        <div className="h-4 bg-gray-200 rounded"></div>
                                                    </div>
                                                    <div className="w-1/4 px-1">
                                                        <div className="h-4 bg-gray-200 rounded"></div>
                                                    </div>
                                                </>
                                            )}
                                            <div
                                                className={`${isMobile ? "w-1/3" : "w-1/4"} flex justify-center`}
                                            >
                                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                                            </div>
                                        </div>
                                    ))
                                ) : sortedTouristInfo.length > 0 ? (
                                    // 실제 데이터 - 모바일 최적화
                                    sortedTouristInfo.map((info, idx) => (
                                        <div
                                            key={idx}
                                            className="flex py-3 border-b hover:bg-gray-100 transition-colors text-xs md:text-base cursor-pointer"
                                            onClick={() =>
                                                handleSpotClick(info)
                                            }
                                        >
                                            <div
                                                className={`${isMobile ? "w-2/3" : "w-1/4"} text-center text-black overflow-hidden text-ellipsis px-1 ${isMobile ? "text-xs font-medium" : ""}`}
                                            >
                                                {info.area_nm}
                                            </div>
                                            {!isMobile && (
                                                <>
                                                    <div className="w-1/4 text-center text-black overflow-hidden text-ellipsis px-1">
                                                        {info.population
                                                            ?.area_cd || "N/A"}
                                                    </div>
                                                    <div className="w-1/4 text-center text-black overflow-hidden text-ellipsis px-1">
                                                        {info.population
                                                            ?.ppltn_time ||
                                                            "N/A"}
                                                    </div>
                                                </>
                                            )}
                                            <div
                                                className={`${isMobile ? "w-1/3" : "w-1/4"} text-center overflow-hidden flex justify-center`}
                                            >
                                                <CongestionTag
                                                    level={
                                                        info.population
                                                            ?.area_congest_lvl ||
                                                        "여유"
                                                    }
                                                    size={
                                                        isMobile ? "xs" : "sm"
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    // 데이터 없음
                                    <div className="p-4 text-center text-gray-500">
                                        관광지 정보가 없습니다.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* End of Main Container*/}
        </div>
    );
}
