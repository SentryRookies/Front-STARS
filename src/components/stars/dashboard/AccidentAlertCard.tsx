import { motion } from "framer-motion";
import { AccidentData } from "../../../data/adminData";

interface AccidentAlertCardProps {
    style: { opacity: number; y: number; scale: number };
    cardRef: (el: HTMLDivElement | null) => void;
    accidents: AccidentData[];
}

const getAccidentIcon = (type: string): string => {
    switch (type) {
        case "공사":
            return "🔧";
        case "낙하물":
            return "⚠️";
        case "사고":
            return "🚧";
        default:
            return "❗️";
    }
};

export default function AccidentAlertCard({
    style,
    cardRef,
    accidents,
}: AccidentAlertCardProps) {
    return (
        <motion.div
            className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 bg-blue-500 rounded-3xl shadow-sm p-5 my-2"
            whileHover={{ y: -6 }}
            animate={
                style
                    ? { opacity: style.opacity, y: style.y, scale: style.scale }
                    : {}
            }
            style={style}
            ref={cardRef}
        >
            <h2 className="text-lg font-bold text-white mb-3">
                사건·사고 알림
            </h2>

            {accidents.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-white text-center py-8">
                    {/* SVG 아이콘 */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="60"
                        height="60"
                        viewBox="0,0,255.99609,255.99609"
                    >
                        <g fill="#ffffff">
                            <g transform="scale(5.12,5.12)">
                                <path d="M25,2c-12.683,0 -23,10.317 -23,23c0,12.683 10.317,23 23,23c12.683,0 23,-10.317 23,-23c0,-4.56 -1.33972,-8.81067 -3.63672,-12.38867l-1.36914,1.61719c1.895,3.154 3.00586,6.83148 3.00586,10.77148c0,11.579 -9.421,21 -21,21c-11.579,0 -21,-9.421 -21,-21c0,-11.579 9.421,-21 21,-21c5.443,0 10.39391,2.09977 14.12891,5.50977l1.30859,-1.54492c-4.085,-3.705 -9.5025,-5.96484 -15.4375,-5.96484zM43.23633,7.75391l-19.32227,22.80078l-8.13281,-7.58594l-1.36328,1.46289l9.66602,9.01563l20.67969,-24.40039z"></path>
                            </g>
                        </g>
                    </svg>
                    <p className="text-sm font-medium mt-2">
                        현재 이 관광특구에는
                        <br />
                        <span className="font-bold">사고 정보가 없습니다.</span>
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto rounded-2xl scrollbar-none">
                    {accidents.map((acc, idx) => (
                        <div
                            key={idx}
                            className="bg-blue-100 rounded-2xl shadow-lg p-3 text-sm"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl">
                                    {getAccidentIcon(acc.acdnt_type)}
                                </span>
                                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white">
                                    {acc.acdnt_type}
                                </span>
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500 text-white">
                                    {acc.acdnt_dtype}
                                </span>
                            </div>
                            <p className="text-sm text-gray-800 leading-snug">
                                {acc.acdnt_info}
                            </p>
                            <p className="text-xs text-blue-500 mt-1">
                                발생: {acc.acdnt_occr_dt} / 해제:{" "}
                                {acc.exp_clr_dt}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
