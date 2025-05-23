import React, { useState } from "react";
import { motion } from "framer-motion";
import { AccidentData } from "../../data/adminData";

interface AccidentAlertModalProps {
    accidents: AccidentData[];
    onViewArea?: (areaId: number) => void;
}

// 사고 유형별 아이콘 매핑 (실제 데이터: "공사")
const getAccidentIcon = (type: string): string => {
    switch (type) {
        case "공사":
            return "🔧";
        case "낙하물":
            return "⚠️";
        case "사고":
            return "🚧";
        case "화재":
            return "🔥";
        case "침수":
            return "🌊";
        case "교통사고":
            return "🚗";
        case "시위":
            return "📢";
        default:
            return "❗";
    }
};

// 사고 유형별 색상 매핑 (실제 데이터: "공사")
const getAccidentColor = (type: string): string => {
    switch (type) {
        case "공사":
            return "bg-yellow-500";
        case "낙하물":
            return "bg-orange-500";
        case "사고":
        case "교통사고":
            return "bg-red-500";
        case "화재":
            return "bg-red-600";
        case "침수":
            return "bg-blue-500";
        case "시위":
            return "bg-purple-500";
        default:
            return "bg-gray-500";
    }
};

// 사고 세부 유형별 배지 색상 (실제 데이터: "시설물보수", "도로보수" 등)
const getDtypeColor = (dtype: string): string => {
    switch (dtype) {
        case "시설물보수":
            return "bg-blue-500 text-white";
        case "도로보수":
            return "bg-orange-500 text-white";
        case "긴급상황":
            return "bg-red-500 text-white";
        case "교통통제":
            return "bg-purple-500 text-white";
        default:
            return "bg-gray-500 text-white";
    }
};

export const AccidentAlertModal: React.FC<AccidentAlertModalProps> = ({
    accidents,
    onViewArea,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    // 활성 사고 목록 (모든 사고)
    const activeAccidents = accidents || [];

    // 지역별 사고 그룹화 (accident 데이터의 area_nm 사용)
    const accidentsByArea = activeAccidents.reduce(
        (acc, accident) => {
            // accident 데이터에서 직접 지역 정보 사용
            if (!acc[accident.area_id]) {
                acc[accident.area_id] = {
                    area_id: accident.area_id,
                    area_name: accident.area_nm,
                    accidents: [],
                };
            }
            acc[accident.area_id].accidents.push(accident);
            return acc;
        },
        {} as Record<
            number,
            { area_id: number; area_name: string; accidents: AccidentData[] }
        >
    );

    return (
        <div className="absolute md:top-20 top-36 right-4 z-10 flex flex-col items-end gap-2">
            {/* 토글 버튼 */}
            <motion.button
                className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg font-semibold text-base transition-all duration-300 ${
                    activeAccidents.length > 0
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-white text-gray-500 hover:bg-gray-200"
                }`}
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {activeAccidents.length > 0 ? (
                    <>
                        <span className="text-lg">🚨</span>
                        <span>사고 {activeAccidents.length}건</span>
                        <motion.div
                            className="w-2 h-2 bg-white rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                        <svg
                            className={`w-4 h-4 ml-1 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </>
                ) : (
                    <>
                        <span className="text-lg">✅</span>
                        <span>사고 없음</span>
                        <svg
                            className={`w-4 h-4 ml-1 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </>
                )}
            </motion.button>

            {/* 모달 */}
            <div
                className={`w-full transition-all overflow-hidden ${
                    isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <motion.div
                    className="md:max-h-96 max-h-80 rounded-2xl overflow-hidden md:w-96 w-80"
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* 내용 */}
                    <div className="md:max-h-80 max-h-64 overflow-y-auto">
                        {activeAccidents.length === 0 ? (
                            <div className="md:p-8 p-6 text-center">
                                <div className="md:text-6xl text-4xl mb-4">
                                    ✅
                                </div>
                                <h4 className="md:text-lg text-base font-semibold text-gray-800 mb-2">
                                    모든 지역이 안전합니다
                                </h4>
                                <p className="text-gray-500 md:text-sm text-xs">
                                    현재 발생한 사고가 없습니다.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                {Object.values(accidentsByArea).map(
                                    ({ area_id, area_name, accidents }) => (
                                        <motion.div
                                            key={area_id}
                                            className="border bg-white border-gray-200 rounded-xl md:p-3 p-2.5 hover:shadow-md transition-shadow"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                        >
                                            {/* 지역 정보 */}
                                            <div className="flex items-center justify-between md:mb-2.5 mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 md:text-base text-sm">
                                                        {area_name}
                                                    </h4>
                                                    <p className="md:text-xs text-xs text-gray-500">
                                                        관광특구 ·{" "}
                                                        {accidents.length}건
                                                        발생
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onViewArea?.(area_id);
                                                        setIsOpen(!isOpen);
                                                    }}
                                                    className="md:px-3 md:py-1 px-2 py-1 bg-indigo-500 text-white md:text-xs text-xs rounded-full hover:bg-indigo-600 transition-colors"
                                                >
                                                    지역 보기
                                                </button>
                                            </div>

                                            {/* 사고 목록 */}
                                            <div className="md:space-y-1.5 space-y-1">
                                                {accidents.map(
                                                    (accident, idx) => (
                                                        <div
                                                            key={`${accident.area_id}-${idx}`}
                                                            className="bg-gray-50 rounded-lg md:p-2.5 p-2"
                                                        >
                                                            {/* 사고 정보 */}
                                                            <div className="flex items-start gap-2 md:mb-1.5 mb-1">
                                                                <span className="md:text-lg text-base flex-shrink-0">
                                                                    {getAccidentIcon(
                                                                        accident.acdnt_type
                                                                    )}
                                                                </span>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 md:mb-1 mb-0.5">
                                                                        <span
                                                                            className={`md:px-2 md:py-0.5 px-1.5 py-0.5 md:text-xs text-xs font-semibold rounded-full ${getAccidentColor(accident.acdnt_type)} text-white`}
                                                                        >
                                                                            {
                                                                                accident.acdnt_type
                                                                            }
                                                                        </span>
                                                                        <span
                                                                            className={`md:px-2 md:py-0.5 px-1.5 py-0.5 md:text-xs text-xs font-semibold rounded-full ${getDtypeColor(accident.acdnt_dtype)}`}
                                                                        >
                                                                            {
                                                                                accident.acdnt_dtype
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <p className="md:text-sm text-xs text-gray-800 leading-snug">
                                                                        <span className="font-medium text-gray-900">
                                                                            📍{" "}
                                                                            {
                                                                                accident.area_nm
                                                                            }
                                                                        </span>
                                                                        <br />
                                                                        {
                                                                            accident.acdnt_info
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* 시간 정보 */}
                                                            <div className="md:text-xs text-xs text-gray-500 md:mt-1.5 mt-1 md:space-y-0.5 space-y-0.5">
                                                                <div className="flex justify-between">
                                                                    <span>
                                                                        🕐
                                                                        발생시간:
                                                                    </span>
                                                                    <span className="font-medium">
                                                                        {
                                                                            accident.acdnt_occr_dt
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>
                                                                        ⏰
                                                                        예상해제:
                                                                    </span>
                                                                    <span className="font-medium">
                                                                        {
                                                                            accident.exp_clr_dt
                                                                        }
                                                                    </span>
                                                                </div>
                                                                {accident.acdnt_time !==
                                                                    accident.acdnt_occr_dt && (
                                                                    <div className="flex justify-between">
                                                                        <span>
                                                                            📡
                                                                            업데이트:
                                                                        </span>
                                                                        <span className="font-medium">
                                                                            {
                                                                                accident.acdnt_time
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </motion.div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
