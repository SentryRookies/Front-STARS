import React, { useRef, useEffect, useState } from "react";
import { PieChart, Pie, ResponsiveContainer, Tooltip, Cell } from "recharts";

interface Data {
    name: string;
    value: number;
    fill: string;
}

interface PieCardProps {
    name: string;
    datas: Data[];
}

interface RenderLabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
}

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
}: RenderLabelProps) => {
    // 8% 미만은 라벨 표시하지 않음
    if (percent < 0.08) return null;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="12"
            fontWeight="700"
            className="drop-shadow-sm"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const PieCard = ({ datas, name }: PieCardProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 300, height: 200 });
    const [isVisible, setIsVisible] = useState(false);

    // 더 다양한 샘플 데이터
    const sampleData = [
        { name: "남성", value: 52.3, fill: "#3b82f6" },
        { name: "여성", value: 47.7, fill: "#ec4899" },
    ];

    const data = datas || sampleData;
    const chartName = name || "성별 분포";

    // 예쁜 색상 팔레트
    const beautifulColors = [
        "#3b82f6", // blue
        "#ec4899", // pink
        "#10b981", // emerald
        "#f59e0b", // amber
        "#8b5cf6", // violet
        "#06b6d4", // cyan
        "#84cc16", // lime
        "#ef4444", // red
    ];

    // 데이터에 예쁜 색상 적용
    const coloredData = data.map((item, index) => ({
        ...item,
        fill: item.fill || beautifulColors[index % beautifulColors.length],
    }));

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);

        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } =
                    containerRef.current.getBoundingClientRect();
                if (width > 0 && height > 0) {
                    setDimensions({ width, height });
                }
            }
        };

        updateDimensions();

        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        window.addEventListener("resize", updateDimensions);

        return () => {
            clearTimeout(timer);
            if (resizeObserver && containerRef.current) {
                resizeObserver.disconnect();
            }
            window.removeEventListener("resize", updateDimensions);
        };
    }, []);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{ backgroundColor: data.payload.fill }}
                        />
                        <div>
                            <p className="font-semibold text-gray-900">
                                {data.name}
                            </p>
                            <p className="text-lg font-bold text-gray-800">
                                {data.value}%
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div
            ref={containerRef}
            className={`bg-white rounded-lg border border-gray-200 p-4 transition-all duration-500 ${
                isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
            }`}
        >
            <div className="mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-indigo-500 rounded"></div>
                    <h3 className="text-lg font-bold text-gray-900">
                        {chartName}
                    </h3>
                </div>
            </div>

            <div className="h-48 flex items-center justify-center">
                {isVisible && dimensions.width > 0 && dimensions.height > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <defs>
                                {coloredData.map((item, index) => (
                                    <filter
                                        key={`shadow-${index}`}
                                        id={`shadow-${index}`}
                                    >
                                        <feDropShadow
                                            dx="0"
                                            dy="2"
                                            stdDeviation="3"
                                            floodOpacity="0.3"
                                        />
                                    </filter>
                                ))}
                            </defs>
                            <Tooltip content={<CustomTooltip />} />
                            <Pie
                                data={coloredData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                startAngle={90}
                                endAngle={450}
                                label={renderCustomizedLabel}
                                labelLine={false}
                                outerRadius={80}
                                innerRadius={35}
                                stroke="white"
                                strokeWidth={3}
                                animationBegin={200}
                                animationDuration={1000}
                            >
                                {coloredData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.fill}
                                        filter={`url(#shadow-${index})`}
                                        className="hover:brightness-110 transition-all duration-200"
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center text-gray-400 text-sm">
                        데이터 로딩 중...
                    </div>
                )}
            </div>

            {/* 커스텀 범례 */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
                {coloredData.map((item, index) => (
                    <div key={index} className="flex items-center gap-1">
                        <div
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-xs font-medium text-gray-600">
                            {item.name} ({item.value}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PieCard;
