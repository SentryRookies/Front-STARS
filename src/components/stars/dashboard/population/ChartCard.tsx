import { motion } from "framer-motion";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

interface ChartCardProps {
    data: { time: string; forecast: number }[];
    style: { opacity: number; y: number; scale: number };
    cardRef: (el: HTMLDivElement | null) => void;
}

// 인구수 단위 변환 함수
function formatPopulation(value: number) {
    if (value >= 10000) return (value / 10000).toFixed(1) + "만";
    if (value >= 1000) return (value / 1000).toFixed(1) + "천";
    return value + "";
}

// 시간 포맷 (예: "12:00" -> "12시")
function formatHour(time: string) {
    // time이 "12:00" 또는 "12" 형태라고 가정
    const hour = time.split(":")[0];
    return `${hour}시`;
}

export default function ChartCard({ data, style, cardRef }: ChartCardProps) {
    const isEmpty = !data || data.length === 0;

    return (
        <motion.div
            className="col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-6 bg-white rounded-3xl shadow-lg p-4 my-2"
            whileHover={{ y: -6 }}
            animate={
                style
                    ? { opacity: style.opacity, y: style.y, scale: style.scale }
                    : {}
            }
            style={style}
            ref={cardRef}
        >
            <p className="text-sm text-gray-500 mb-2">예측 유동인구 추이</p>
            {isEmpty ? (
                <div className="flex flex-col justify-center items-center flex-1 h-[200px] text-xl text-center text-gray-500">
                    <span>이 지역은 새로 추가되었습니다.</span>
                    <span>곧 찾아뵐게요!</span>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="time"
                            tickFormatter={formatHour}
                            interval={1}
                        />
                        <YAxis tickFormatter={formatPopulation} />
                        <Tooltip
                            formatter={(value: number) => [
                                `${value}명`,
                                "예상 인구 수",
                            ]}
                            labelFormatter={formatHour}
                        />
                        <Line
                            type="monotone"
                            dataKey="forecast"
                            stroke="#2b7fff"
                            strokeWidth={5}
                            dot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </motion.div>
    );
}
