import React from "react";
import { AccidentData } from "../../../data/adminData";
import {
    Car,
    Flame,
    Hospital,
    Construction,
    AlertTriangle,
    Mic,
    MapPin,
    AlertCircle,
} from "lucide-react";

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
                icon: <Car size={16} />,
                bgColor: "bg-orange-100",
                textColor: "text-orange-800",
                borderColor: "border-orange-200",
            };
        case "화재":
            return {
                icon: <Flame size={16} />,
                bgColor: "bg-red-100",
                textColor: "text-red-800",
                borderColor: "border-red-200",
            };
        case "의료":
            return {
                icon: <Hospital size={16} />,
                bgColor: "bg-blue-100",
                textColor: "text-blue-800",
                borderColor: "border-blue-200",
            };
        case "공사":
            return {
                icon: <Construction size={16} />,
                bgColor: "bg-yellow-100",
                textColor: "text-yellow-800",
                borderColor: "border-yellow-200",
            };
        case "낙하물":
            return {
                icon: <AlertTriangle size={16} />,
                bgColor: "bg-purple-100",
                textColor: "text-purple-800",
                borderColor: "border-purple-200",
            };
        case "집회및행사":
            return {
                icon: <Mic size={16} />,
                bgColor: "bg-green-100",
                textColor: "text-green-800",
                borderColor: "border-green-200",
            };
        case "기타":
            return {
                icon: <MapPin size={16} />,
                bgColor: "bg-gray-100",
                textColor: "text-gray-800",
                borderColor: "border-gray-200",
            };
        default:
            return {
                icon: <AlertTriangle size={16} />,
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
    <div className="animate-pulse p-3">
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
        <AlertCircle size={32} className="mb-2 text-gray-300" />
        <p className="text-xs">사고 정보 없음</p>
    </div>
);

const AccidentCard: React.FC<AccidentSectionProps> = ({
    accidentData,
    isLoading,
    isMobile,
    onSelectAccident,
}) => {
    return (
        <div className="w-full h-full overflow-hidden">
            {isLoading && accidentData.length === 0 ? (
                <div className="h-full overflow-y-auto">
                    <AccidentTableSkeleton />
                </div>
            ) : accidentData.length > 0 ? (
                isMobile ? (
                    // 모바일 컴팩트 카드 뷰
                    <div className="h-full overflow-y-auto">
                        <div className="space-y-2 p-2">
                            {accidentData.map((data, idx) => {
                                const style = getAccidentStyle(data.acdnt_type);
                                return (
                                    <div
                                        key={idx}
                                        className={`${style.bgColor} border ${style.borderColor} rounded-lg p-2 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.01]`}
                                        onClick={() => onSelectAccident(data)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm flex-shrink-0">
                                                <span
                                                    className={style.textColor}
                                                >
                                                    {style.icon}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
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
                                                <p className="text-xs text-gray-700 line-clamp-2">
                                                    {simplifyRoadInfo(
                                                        data.acdnt_info,
                                                        40
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
                    // 데스크톱 테이블 뷰
                    <div className="h-full flex flex-col">
                        {/* 테이블 헤더 - 고정 */}
                        <div className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <div className="grid grid-cols-5 gap-2 px-2 py-2 text-xs font-medium text-gray-700">
                                <div className="text-center">유형</div>
                                <div className="text-center">지역</div>
                                <div className="text-center">위치</div>
                                <div className="text-center">발생시간</div>
                                <div className="text-center">예상해소</div>
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
                                            className="grid grid-cols-5 gap-2 px-2 py-2 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 cursor-pointer transition-all duration-200 group"
                                            onClick={() =>
                                                onSelectAccident(data)
                                            }
                                        >
                                            <div className="flex items-center justify-center">
                                                <div
                                                    className={`w-6 h-6 flex items-center justify-center ${style.bgColor} rounded-full mr-1 flex-shrink-0`}
                                                >
                                                    <span
                                                        className={
                                                            style.textColor
                                                        }
                                                    >
                                                        {style.icon}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <div
                                                        className={`text-xs font-medium ${style.textColor} truncate`}
                                                    >
                                                        {data.acdnt_type}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-xs text-gray-900 font-medium truncate flex items-center justify-center">
                                                {data.area_nm}
                                            </div>

                                            <div className="text-xs text-gray-600 flex items-center justify-center">
                                                <div
                                                    className="truncate"
                                                    title={data.acdnt_info}
                                                >
                                                    {simplifyRoadInfo(
                                                        data.acdnt_info,
                                                        25
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-xs text-gray-500 flex items-center justify-center">
                                                {formatDateTime(
                                                    data.acdnt_occr_dt
                                                )}
                                            </div>

                                            <div className="text-xs text-gray-500 flex items-center justify-center">
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
    );
};

export default AccidentCard;
