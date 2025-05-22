import React, { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface Data {
    name: string;
    value: number;
    fill: string;
}

interface PopulationRateProps {
    population: Data[];
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: Data;
        value: number;
        dataKey: string;
        name: string;
    }>;
    label?: string;
}

const PopulationRateCard = ({ population }: PopulationRateProps) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isVisible, setIsVisible] = useState(false);

    // 샘플 데이터 (실제 props가 없는 경우)
    const sampleData = [
        { name: "10대", value: 12.5, fill: "#6366f1" },
        { name: "20대", value: 18.3, fill: "#8b5cf6" },
        { name: "30대", value: 22.1, fill: "#ec4899" },
        { name: "40대", value: 19.7, fill: "#f59e0b" },
        { name: "50대", value: 15.2, fill: "#10b981" },
        { name: "60대", value: 8.9, fill: "#06b6d4" },
        { name: "70대+", value: 3.3, fill: "#84cc16" },
    ];

    const data = population || sampleData;

    // 평균값 계산
    const averageValue =
        data.reduce((sum, item) => sum + item.value, 0) / data.length;

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);
        setTimeout(() => setIsVisible(true), 100);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const getBarSize = () => {
        if (windowWidth < 640) return 20;
        if (windowWidth < 1024) return 30;
        return 40;
    };

    // 플랫 컬러 팔레트
    const flatColors = [
        "#6366f1", // indigo
        "#8b5cf6", // violet
        "#ec4899", // pink
        "#f59e0b", // amber
        "#10b981", // emerald
        "#06b6d4", // cyan
        "#84cc16", // lime
    ];

    const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const isAboveAvg = data.value > averageValue;

            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: data.fill }}
                        />
                        <div>
                            <p className="font-semibold text-gray-900">
                                {data.name}
                            </p>
                            <p className="text-lg font-bold text-gray-800">
                                {data.value}%
                            </p>
                            {isAboveAvg && (
                                <p className="text-xs text-green-600 font-medium">
                                    평균 이상
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const getBarColor = (item: Data, index: number) => {
        const isAboveAvg = item.value > averageValue;
        const baseColor = flatColors[index % flatColors.length];

        return {
            fill: baseColor,
            opacity: isAboveAvg ? 1 : 0.6,
        };
    };

    return (
        <div
            className={`bg-white rounded-lg border border-gray-200 p-6 transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-indigo-500 rounded"></div>
                    <h3 className="text-xl font-bold text-gray-900">
                        연령대별 분포
                    </h3>
                    <p className="text-sm text-gray-500">
                        평균 {averageValue.toFixed(1)}% 기준
                    </p>
                </div>
            </div>

            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 15,
                            left: 0,
                            bottom: 25,
                        }}
                        barSize={getBarSize()}
                        barCategoryGap="20%"
                    >
                        <CartesianGrid
                            strokeDasharray="none"
                            vertical={false}
                            stroke="#f1f5f9"
                            strokeWidth={1}
                        />

                        <XAxis
                            dataKey="name"
                            tick={{
                                fontSize: windowWidth < 640 ? 12 : 14,
                                fill: "#64748b",
                                fontWeight: 500,
                            }}
                            angle={0}
                            textAnchor="middle"
                            height={25}
                            axisLine={false}
                            tickLine={false}
                        />

                        <YAxis
                            tick={{
                                fontSize: windowWidth < 640 ? 12 : 14,
                                fill: "#64748b",
                                fontWeight: 500,
                            }}
                            tickFormatter={(value) => `${value}%`}
                            domain={[0, "dataMax + 8"]}
                            axisLine={false}
                            tickLine={false}
                        />

                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                        />

                        <Bar
                            dataKey="value"
                            name="연령 비율"
                            radius={[2, 2, 0, 0]}
                            animationDuration={800}
                            animationBegin={100}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    {...getBarColor(entry, index)}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PopulationRateCard;
