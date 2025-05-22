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
        <div className="w-full h-full border rounded-lg shadow-md bg-white flex flex-col">
            <h2 className="text-sm md:text-base p-2 font-bold text-black border-b flex justify-between items-center">
                <div className="flex items-center">
                    <span>사고 정보</span>
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        {accidentData.length}건
                    </span>
                </div>
                {isLoading && (
                    <span className="text-xs text-blue-500 font-normal flex items-center">
                        <svg
                            className="animate-spin -ml-1 mr-1 h-3 w-3 text-blue-500"
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

            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex-1">
                {isLoading && accidentData.length === 0 ? (
                    <div className="p-3">
                        <AccidentTableSkeleton />
                    </div>
                ) : accidentData.length > 0 ? (
                    isMobile ? (
                        // 모바일 컴팩트 카드 뷰
                        <div className="space-y-1 p-2">
                            {accidentData.map((data, idx) => {
                                const style = getAccidentStyle(data.acdnt_type);
                                return (
                                    <div
                                        key={idx}
                                        className={`${style.bgColor} border ${style.borderColor} rounded-lg p-1.5 cursor-pointer shadow-sm`}
                                        onClick={() => onSelectAccident(data)}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm flex-shrink-0">
                                                <span className="text-base">
                                                    {style.icon}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center">
                                                    <span
                                                        className={`font-medium ${style.textColor} text-xs truncate max-w-[120px]`}
                                                    >
                                                        {data.area_nm}
                                                    </span>
                                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                                        {formatDateTime(
                                                            data.acdnt_occr_dt
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-xs truncate text-gray-700 mt-0.5">
                                                    {simplifyRoadInfo(
                                                        data.acdnt_info,
                                                        30
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        // 데스크톱 테이블 뷰
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            유형
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            지역
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            위치
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            발생시간
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            예상해소
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {accidentData.map((data, idx) => {
                                        const style = getAccidentStyle(
                                            data.acdnt_type
                                        );
                                        return (
                                            <tr
                                                key={idx}
                                                className="hover:bg-gray-50 cursor-pointer"
                                                onClick={() =>
                                                    onSelectAccident(data)
                                                }
                                            >
                                                <td className="px-2 py-1.5 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div
                                                            className={`w-5 h-5 flex items-center justify-center ${style.bgColor} rounded-full mr-1.5`}
                                                        >
                                                            <span className="text-xs">
                                                                {style.icon}
                                                            </span>
                                                        </div>
                                                        <span
                                                            className={`text-xs font-medium ${style.textColor}`}
                                                        >
                                                            {data.acdnt_type}{" "}
                                                            <span className="text-gray-500 font-normal text-xs">
                                                                (
                                                                {
                                                                    data.acdnt_dtype
                                                                }
                                                                )
                                                            </span>
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-900">
                                                    {data.area_nm}
                                                </td>
                                                <td className="px-2 py-1.5 text-xs text-gray-500">
                                                    <div
                                                        className="max-w-xs truncate"
                                                        title={data.acdnt_info}
                                                    >
                                                        {simplifyRoadInfo(
                                                            data.acdnt_info,
                                                            35
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-500">
                                                    {formatDateTime(
                                                        data.acdnt_occr_dt
                                                    )}
                                                </td>
                                                <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-500">
                                                    {formatDateTime(
                                                        data.exp_clr_dt
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    <div className="p-3">
                        <NoAccidentData />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccidentCard;
