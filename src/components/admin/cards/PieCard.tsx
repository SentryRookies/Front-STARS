import React, { useRef, useEffect, useState } from "react";
import { PieChart, Pie, Legend, ResponsiveContainer, Tooltip } from "recharts";

interface Data {
    name: string;
    value: number;
    fill: string;
}

interface PieCardProps {
    name: string;
    datas: Data[];
}

// 파이차트 내 비율 숫자 넣기 위한 데이터타입
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
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor={x > cx ? "start" : "end"}
            dominantBaseline="central"
            fontSize="12"
            fontWeight="bold"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const PieCard = ({ datas, name }: PieCardProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 300, height: 200 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // 컴포넌트가 마운트된 후 약간의 지연을 두고 차트를 표시
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

        // 초기 크기 설정
        updateDimensions();

        // ResizeObserver를 사용하여 컨테이너 크기 변화 감지
        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // 윈도우 리사이즈 이벤트 리스너
        window.addEventListener("resize", updateDimensions);

        return () => {
            clearTimeout(timer);
            if (resizeObserver && containerRef.current) {
                resizeObserver.disconnect();
            }
            window.removeEventListener("resize", updateDimensions);
        };
    }, []);

    // 컨테이너 사이즈에 비례하여 반지름 계산
    const smallerDimension = Math.min(dimensions.width, dimensions.height);
    const outerRadius = Math.max(40, smallerDimension * 0.35); // 파이 차트 크기 조절

    // 툴팁 포맷 함수 수정 - 현재 항목의 이름과 값을 모두 표시
    const customTooltipFormatter = (value: number, name: string) => {
        // entry.payload에는 현재 데이터 객체가 포함됨
        return [`${value}%`, `${name}`];
    };

    return (
        <div
            ref={containerRef}
            className="bg-white shadow rounded-lg p-4 flex flex-col w-full h-full"
        >
            <h3 className="font-semibold text-xl text-black mb-2">{name}</h3>
            <div
                className="flex-grow flex items-center justify-center"
                style={{ minHeight: "180px" }}
            >
                {isVisible && dimensions.width > 0 && dimensions.height > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                            <Legend
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                wrapperStyle={{
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    paddingTop: "10px",
                                }}
                                iconSize={10}
                            />
                            <Tooltip
                                formatter={customTooltipFormatter}
                                contentStyle={{ fontSize: "14px" }}
                            />
                            <Pie
                                data={datas}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="80%"
                                startAngle={0}
                                endAngle={180}
                                label={renderCustomizedLabel}
                                labelLine={false}
                                outerRadius={outerRadius}
                                innerRadius={outerRadius * 0.4} // 도넛 형태로 변경
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-xs">
                            로딩 중...
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PieCard;
