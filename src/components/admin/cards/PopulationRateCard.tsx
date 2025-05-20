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

const PopulationRateCard = ({ population }: PopulationRateProps) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // Get the average value to highlight above-average bars
    const averageValue =
        population.reduce((sum, item) => sum + item.value, 0) /
        population.length;

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Calculate appropriate bar size based on window width
    const getBarSize = () => {
        if (windowWidth < 640) return 16; // Mobile screens
        if (windowWidth < 1024) return 28; // Tablet screens
        return 40; // Desktop screens
    };

    // Customize tooltip content
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-2 border shadow-md rounded">
                    <p className="font-semibold">{data.name}</p>
                    <p className="text-sm">{`${data.value}%`}</p>
                </div>
            );
        }
        return null;
    };

    // Get styling for each bar to highlight above average
    const getBarFill = (item: Data) => {
        return item.value > averageValue ? item.fill : `${item.fill}90`;
    };

    return (
        <div className="bg-white rounded-lg p-4 shadow h-full flex flex-col">
            <div className="mb-4">
                <h3 className="font-semibold text-lg text-gray-700">
                    연령대별 분포
                </h3>
                <p className="text-sm text-gray-500">
                    평균 {averageValue.toFixed(1)}% 기준
                </p>
            </div>

            <div className="flex-grow flex flex-col">
                <ResponsiveContainer width="100%" height="100%" minHeight={220}>
                    <BarChart
                        data={population}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 5,
                            bottom: 40,
                        }}
                        barSize={getBarSize()}
                        barCategoryGap="10%"
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f0f0f0"
                        />
                        <XAxis
                            dataKey="name"
                            tick={{
                                fontSize: windowWidth < 640 ? 10 : 12,
                                fill: "#4B5563",
                            }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis
                            tick={{
                                fontSize: windowWidth < 640 ? 10 : 12,
                                fill: "#4B5563",
                            }}
                            tickFormatter={(value) => `${value}%`}
                            domain={[0, "dataMax + 5"]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="value"
                            name="연령 비율"
                            radius={[4, 4, 0, 0]}
                        >
                            {population.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={getBarFill(entry)}
                                    stroke={
                                        entry.value > averageValue
                                            ? entry.fill
                                            : "none"
                                    }
                                    strokeWidth={2}
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
