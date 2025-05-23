import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AccidentData } from "../../data/adminData";

interface AccidentAlertModalProps {
    accidents: AccidentData[];
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

    const handleViewArea = (areaId: number, areaName: string) => {
        console.log(`${areaName}(ID: ${areaId}) 지역 보기 요청`);
        alert(`${areaName} 지역으로 이동합니다.`);
        setIsOpen(false);
    };

    return (
        <div className="fixed top-6 left-6 z-30">
            {/* 토글 버튼 */}
            <motion.button
                className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg font-semibold transition-all duration-300 ${
                    activeAccidents.length > 0
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
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
                    </>
                ) : (
                    <>
                        <span className="text-lg">✅</span>
                        <span>사고 없음</span>
                    </>
                )}
            </motion.button>

            {/* 모달 */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="absolute top-16 left-0 w-96 max-h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* 헤더 */}
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🚨</span>
                                <h3 className="text-lg font-bold">사고 현황</h3>
                            </div>
                            <p className="text-sm text-red-100 mt-1">
                                현재 {activeAccidents.length}건의 사고가
                                발생했습니다
                            </p>
                        </div>

                        {/* 내용 */}
                        <div className="max-h-80 overflow-y-auto">
                            {activeAccidents.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="text-6xl mb-4">✅</div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                        모든 지역이 안전합니다
                                    </h4>
                                    <p className="text-gray-500 text-sm">
                                        현재 발생한 사고가 없습니다.
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 space-y-4">
                                    {Object.values(accidentsByArea).map(
                                        ({ area_id, area_name, accidents }) => (
                                            <motion.div
                                                key={area_id}
                                                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                            >
                                                {/* 지역 정보 */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800">
                                                            {area_name}
                                                        </h4>
                                                        <p className="text-xs text-gray-500">
                                                            관광특구 ·{" "}
                                                            {accidents.length}건
                                                            발생
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleViewArea(
                                                                area_id,
                                                                area_name
                                                            )
                                                        }
                                                        className="px-3 py-1 bg-indigo-500 text-white text-xs rounded-full hover:bg-indigo-600 transition-colors"
                                                    >
                                                        지역 보기
                                                    </button>
                                                </div>

                                                {/* 사고 목록 */}
                                                <div className="space-y-2">
                                                    {accidents.map(
                                                        (accident, idx) => (
                                                            <div
                                                                key={`${accident.area_id}-${idx}`}
                                                                className="bg-gray-50 rounded-lg p-3"
                                                            >
                                                                {/* 사고 정보 */}
                                                                <div className="flex items-start gap-2 mb-2">
                                                                    <span className="text-lg flex-shrink-0">
                                                                        {getAccidentIcon(
                                                                            accident.acdnt_type
                                                                        )}
                                                                    </span>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span
                                                                                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getAccidentColor(accident.acdnt_type)} text-white`}
                                                                            >
                                                                                {
                                                                                    accident.acdnt_type
                                                                                }
                                                                            </span>
                                                                            <span
                                                                                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getDtypeColor(accident.acdnt_dtype)}`}
                                                                            >
                                                                                {
                                                                                    accident.acdnt_dtype
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-sm text-gray-800 leading-snug">
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
                                                                <div className="text-xs text-gray-500 mt-2 space-y-1">
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

                        {/* 푸터 */}
                        {activeAccidents.length > 0 && (
                            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                                <p className="text-xs text-gray-500 text-center">
                                    실시간 사고 정보는 5분마다 업데이트됩니다
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 배경 오버레이 */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-20 -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
