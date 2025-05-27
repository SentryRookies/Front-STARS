import React from "react";
import { AccidentData } from "../../../data/adminData";

interface AccidentSectionProps {
    accidentData: AccidentData[];
    isLoading: boolean;
    isMobile: boolean;
    onSelectAccident: (data: AccidentData) => void;
}

// 사고 타입에 따른 아이콘과 색상 매핑
const getAccidentStyle = (type: string) => {
    switch (type.toLowerCase()) {
        case "교통사고":
            return {
                icon: "🚗",
                bgColor: "bg-orange-100",
                textColor: "text-orange-800",
                borderColor: "border-orange-200",
            };
        case "화재":
            return {
                icon: "🔥",
                bgColor: "bg-red-100",
                textColor: "text-red-800",
                borderColor: "border-red-200",
            };
        case "의료":
            return {
                icon: "🏥",
                bgColor: "bg-blue-100",
                textColor: "text-blue-800",
                borderColor: "border-blue-200",
            };
        case "공사":
            return {
                icon: "🚧",
                bgColor: "bg-yellow-100",
                textColor: "text-yellow-800",
                borderColor: "border-yellow-200",
            };
        case "낙하물":
            return {
                icon: "⚠️",
                bgColor: "bg-purple-100",
                textColor: "text-purple-800",
                borderColor: "border-purple-200",
            };
        case "집회및행사":
            return {
                icon: "🎤",
                bgColor: "bg-green-100",
                textColor: "text-green-800",
                borderColor: "border-green-200",
            };
        case "기타":
            return {
                icon: "📌",
                bgColor: "bg-gray-100",
                textColor: "text-gray-800",
                borderColor: "border-gray-200",
            };
        default:
            return {
                icon: "⚠️",
                bgColor: "bg-gray-100",
                textColor: "text-gray-800",
                borderColor: "border-gray-200",
            };
    }
};

// 날짜 및 시간 포맷팅
const formatDateTime = (dateTimeStr: string): string => {
    if (!dateTimeStr) return "정보 없음";

    // 다양한 날짜 형식 처리
    try {
        // YYYY-MM-DD HH:MM 형식 처리
        if (dateTimeStr.includes("-") && dateTimeStr.includes(":")) {
            const parts = dateTimeStr.split(" ");
            return parts[1] || parts[0]; // 시간 부분만 반환 또는 전체
        }

        // 다른 형식의 경우 원본 반환
        return dateTimeStr;
    } catch (e) {
        return dateTimeStr;
    }
};

// 도로 정보 간결화
const simplifyRoadInfo = (info: string, maxLength: number = 30): string => {
    if (!info) return "";

    const result = info
        .replace(/\|/g, " ") // 파이프 제거
        .replace(/서울종합방재센터.*?[\)-]/, ""); // 불필요한 정보 제거

    return result.length > maxLength
        ? `${result.substring(0, maxLength)}...`
        : result;
};

// 로딩 스켈레톤 컴포넌트
const AccidentTableSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-full mb-3"></div>
        {[...Array(5)].map((_, idx) => (
            <div
                key={idx}
                className="h-12 bg-gray-200 rounded w-full mb-2"
            ></div>
        ))}
    </div>
);

// 사고 정보 없음 컴포넌트
const NoAccidentData = () => (
    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <svg
            className="w-12 h-12 text-gray-300 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
        </svg>
        <p className="text-center">사고 정보가 없거나 불러올 수 없습니다.</p>
    </div>
);

const AccidentCard: React.FC<AccidentSectionProps> = ({
    accidentData,
    isLoading,
    isMobile,
    onSelectAccident,
}) => {
    // 모바일 뷰와 데스크톱 뷰에 따른 조건부 렌더링
    return (
        <div className="w-full h-full bg-white flex flex-col overflow-hidden">
            {/* 카드 헤더 - 고정 */}
            <div className="flex-shrink-0 p-3 border-b border-gray-200 bg-white">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <span className="font-semibold text-sm text-gray-800">
                            사고 정보
                        </span>
                        <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                            {accidentData.length}건
                        </span>
                    </div>
                    {isLoading && (
                        <span className="text-xs text-red-500 font-normal flex items-center">
                            <svg
                                className="animate-spin -ml-1 mr-1 h-3 w-3 text-red-500"
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
                </div>
            </div>

            {/* 콘텐츠 영역 - 스크롤 가능 */}
            <div className="flex-1 overflow-hidden">
                {isLoading && accidentData.length === 0 ? (
                    <div className="p-3 h-full overflow-y-auto">
                        <AccidentTableSkeleton />
                    </div>
                ) : accidentData.length > 0 ? (
                    isMobile ? (
                        // 모바일 컴팩트 카드 뷰
                        <div className="h-full overflow-y-auto">
                            <div className="space-y-2 p-3">
                                {accidentData.map((data, idx) => {
                                    const style = getAccidentStyle(
                                        data.acdnt_type
                                    );
                                    return (
                                        <div
                                            key={idx}
                                            className={`${style.bgColor} border ${style.borderColor} rounded-lg p-3 cursor-pointer shadow-sm hover:shadow-md transition-shadow`}
                                            onClick={() =>
                                                onSelectAccident(data)
                                            }
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm flex-shrink-0">
                                                    <span className="text-lg">
                                                        {style.icon}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span
                                                            className={`font-medium ${style.textColor} text-sm truncate max-w-[150px]`}
                                                        >
                                                            {data.area_nm}
                                                        </span>
                                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                                            {formatDateTime(
                                                                data.acdnt_occr_dt
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-700 line-clamp-2">
                                                        {simplifyRoadInfo(
                                                            data.acdnt_info,
                                                            50
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        // 데스크톱 테이블 뷰 - 고정 헤더
                        <div className="h-full flex flex-col">
                            {/* 테이블 헤더 - 고정 */}
                            <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200">
                                <div className="grid grid-cols-5 gap-2 px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <div>유형</div>
                                    <div>지역</div>
                                    <div>위치</div>
                                    <div>발생시간</div>
                                    <div>예상해소</div>
                                </div>
                            </div>

                            {/* 테이블 바디 - 스크롤 가능 */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="divide-y divide-gray-200">
                                    {accidentData.map((data, idx) => {
                                        const style = getAccidentStyle(
                                            data.acdnt_type
                                        );
                                        return (
                                            <div
                                                key={idx}
                                                className="grid grid-cols-5 gap-2 px-3 py-3 hover:bg-gray-50 cursor-pointer transition-colors group"
                                                onClick={() =>
                                                    onSelectAccident(data)
                                                }
                                            >
                                                <div className="flex items-center">
                                                    <div
                                                        className={`w-6 h-6 flex items-center justify-center ${style.bgColor} rounded-full mr-2 flex-shrink-0`}
                                                    >
                                                        <span className="text-sm">
                                                            {style.icon}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div
                                                            className={`text-xs font-medium ${style.textColor} truncate`}
                                                        >
                                                            {data.acdnt_type}
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate">
                                                            {data.acdnt_dtype}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-xs text-gray-900 font-medium truncate flex items-center">
                                                    {data.area_nm}
                                                </div>

                                                <div className="text-xs text-gray-600 flex items-center">
                                                    <div
                                                        className="truncate"
                                                        title={data.acdnt_info}
                                                    >
                                                        {simplifyRoadInfo(
                                                            data.acdnt_info,
                                                            40
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-xs text-gray-500 flex items-center">
                                                    {formatDateTime(
                                                        data.acdnt_occr_dt
                                                    )}
                                                </div>

                                                <div className="text-xs text-gray-500 flex items-center">
                                                    {formatDateTime(
                                                        data.exp_clr_dt
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <NoAccidentData />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccidentCard;
