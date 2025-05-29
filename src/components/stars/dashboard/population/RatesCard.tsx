import { motion } from "framer-motion";
import { usePlace } from "../../../../context/PlaceContext";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    LabelList,
    ResponsiveContainer,
} from "recharts";

interface RatesCardProps {
    style: { opacity: number; y: number; scale: number };
    cardRef: (el: HTMLDivElement | null) => void;
}

export default function RatesCard({ style, cardRef }: RatesCardProps) {
    const { congestionInfo } = usePlace();

    const male = congestionInfo?.male_ppltn_rate ?? 0;
    const female = congestionInfo?.female_ppltn_rate ?? 0;
    const ageRates = congestionInfo?.ppltn_rates ?? [];
    const ageLabels = [
        "0~9",
        "10대",
        "20대",
        "30대",
        "40대",
        "50대",
        "60대",
        "70대+",
    ];

    const ageChartData = ageRates.map((rate, idx) => ({
        age: ageLabels[idx],
        value: Number(rate.toFixed(1)),
    }));

    return (
        <motion.div
            className="col-span-12 sm:col-span-6 md:col-span-7 lg:col-span-8 bg-white rounded-3xl shadow-lg p-4 flex flex-col gap-4 my-2"
            whileHover={{ y: -6 }}
            animate={
                style
                    ? { opacity: style.opacity, y: style.y, scale: style.scale }
                    : {}
            }
            style={style}
            ref={cardRef}
        >
            <h3 className="font-semibold text-lg text-black mb-2">
                유동인구 성별/연령 분포
            </h3>

            <div className="w-full bg-gray-100 rounded-2xl shadow-lg overflow-hidden h-16 flex">
                <div
                    className="bg-indigo-600 text-white font-bold text-lg flex items-center justify-center"
                    style={{ width: `${male}%` }}
                >
                    남 {male.toFixed(1)}%
                </div>
                <div
                    className="bg-indigo-500 text-white font-bold text-lg flex items-center justify-center"
                    style={{ width: `${female}%` }}
                >
                    여 {female.toFixed(1)}%
                </div>
            </div>

            <div className="mt-4">
                <h4 className="text-lg font-semibold mb-3 text-black">
                    연령대 분포
                </h4>
                <div className="w-full h-40 bg-white rounded-xl px-4 py-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ageChartData}>
                            {/* X 축 */}
                            <XAxis
                                dataKey="age"
                                tick={{ fill: "#6366f1", fontSize: 12 }} // indigo-500
                                axisLine={false}
                                tickLine={false}
                            />
                            {/* Y 축 */}
                            <YAxis
                                hide={true}
                                domain={[0, "dataMax + 5"]}
                                tick={{ fill: "#6366f1", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            {/* Bar 그래프 */}
                            <Bar
                                dataKey="value"
                                fill="#6366f1" // indigo-500
                                barSize={18}
                                radius={[6, 6, 0, 0]}
                            >
                                <LabelList
                                    dataKey="value"
                                    position="top"
                                    formatter={(val: number) =>
                                        `${val.toFixed(1)}%`
                                    }
                                    style={{
                                        fill: "#4f46e5", // indigo-600
                                        fontSize: 12,
                                        fontWeight: 600,
                                    }}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
}
