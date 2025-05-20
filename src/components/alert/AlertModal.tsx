import React, { useState } from "react";

export type AlertType = "danger" | "warning" | "info" | "success";

export interface CongestionAlert {
    id: number;
    area_nm: string;
    area_id: number;
    area_congest_lvl: string;
    area_congest_msg: string;
    ppltn_time: string;
    type: AlertType;
}

interface AlertModalProps {
    alerts: CongestionAlert[];
    onDismiss: (id: number) => void;
    onViewArea?: (areaId: number) => void;
}

const baseAlertClass = "p-3 border rounded-lg cursor-pointer";
const alertClass = {
    info: `${baseAlertClass} text-blue-800 border-blue-300 bg-blue-50 hover:bg-blue-100`,
    danger: `${baseAlertClass} text-red-800 border-red-300 bg-red-50 hover:bg-red-100`,
    success: `${baseAlertClass} text-green-800 border-green-300 bg-green-50 hover:bg-green-100`,
    warning: `${baseAlertClass} text-yellow-800 border-yellow-300 bg-yellow-50 hover:bg-yellow-100`,
};

const getBadgeClass = (level: string) => {
    if (level.includes("약간 붐빔")) return "bg-yellow-200 text-yellow-800";
    if (level.includes("붐빔")) return "bg-red-200 text-red-800";
    if (level.includes("보통")) return "bg-green-200 text-green-800";
    if (level.includes("여유")) return "bg-blue-200 text-blue-800";
    return "bg-gray-100 text-gray-800";
};

export default function AlertModal({
    alerts,
    onDismiss,
    onViewArea,
}: AlertModalProps) {
    const [expanded, setExpanded] = useState<number[]>([]);
    const [showAlerts, setShowAlerts] = useState(false);

    const toggleExpand = (id: number) => {
        setExpanded((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // 붐빔이 가장 위에 오도록 정렬
    const sortedAlerts = [...alerts].sort((a, b) => {
        if (a.area_congest_lvl === "붐빔" && b.area_congest_lvl !== "붐빔") {
            return -1;
        }
        if (a.area_congest_lvl !== "붐빔" && b.area_congest_lvl === "붐빔") {
            return 1;
        }
        return 0;
    });

    return (
        <div className="absolute md:top-4 top-24 right-4 z-10 flex flex-col items-end gap-2">
            <button
                className="mb-2 px-4 py-2 rounded-full bg-gradient-to-r bg-white shadow-lg text-indigo-500 font-semibold text-base flex items-center gap-2 transition-all duration-200 hover:bg-indigo-500 hover:text-white"
                onClick={() => setShowAlerts((prev) => !prev)}
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                    />
                </svg>
                혼잡 지역 확인
                <svg
                    className={`w-4 h-4 ml-1 transform transition-transform duration-300 ${showAlerts ? "rotate-180" : ""}`}
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
            </button>
            <div
                className={`w-full transition-all overflow-hidden ${
                    showAlerts
                        ? "max-h-[1000px] opacity-100"
                        : "max-h-0 opacity-0"
                }`}
            >
                <div
                    className={`flex flex-col gap-1 ${
                        alerts.length > 7 ? "max-h-96 overflow-y-auto pr-1" : ""
                    }`}
                >
                    {sortedAlerts.map((alert) => {
                        const isExpanded = expanded.includes(alert.id);
                        return (
                            <div
                                key={alert.id}
                                className={`${alertClass[alert.type]} transition-all shadow-md md:max-w-xs max-w-72`}
                                role="button"
                                tabIndex={0}
                                onClick={() => toggleExpand(alert.id)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        toggleExpand(alert.id);
                                    }
                                }}
                            >
                                <div className="flex items-center justify-between gap-2 w-full">
                                    <div>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getBadgeClass(
                                                alert.area_congest_lvl
                                            )}`}
                                        >
                                            {alert.area_congest_lvl}
                                        </span>
                                    </div>
                                    <div className="flex-1 flex justify-right">
                                        <h3 className="text-sm font-medium">
                                            {alert.area_nm}
                                        </h3>
                                    </div>
                                    <div>
                                        <button
                                            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-600 hover:text-gray-900 transition-colors duration-150 cursor-pointer bg-transparent"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDismiss(alert.id);
                                            }}
                                            aria-label="닫기"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                                <div
                                    className={`transition-all duration-300 overflow-hidden text-sm ${
                                        isExpanded ? "mt-2 max-h-40" : "max-h-0"
                                    }`}
                                >
                                    {alert.area_congest_msg}
                                    <div
                                        className="underline text-gray-600 text-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowAlerts(false);
                                            onViewArea?.(alert.area_id);
                                        }}
                                    >
                                        보러가기
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
