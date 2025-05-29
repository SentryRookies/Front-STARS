import { motion } from "framer-motion";

interface CongestionStatusCardProps {
    status: "여유" | "보통" | "약간 붐빔" | "붐빔";
    style: { opacity: number; y: number; scale: number };
    cardRef: (el: HTMLDivElement | null) => void;
}

const statusColors: Record<CongestionStatusCardProps["status"], string> = {
    여유: "bg-green-500 text-white",
    보통: "bg-yellow-500 text-white",
    "약간 붐빔": "bg-orange-500 text-white",
    붐빔: "bg-red-500 text-white",
};

export default function CongestionStatusCard({
    status,
    style,
    cardRef,
}: CongestionStatusCardProps) {
    const color = statusColors[status];

    return (
        <motion.div
            className={`col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 rounded-3xl shadow-lg p-4 my-2 ${color}`}
            whileHover={{ y: -6 }}
            animate={
                style
                    ? { opacity: style.opacity, y: style.y, scale: style.scale }
                    : {}
            }
            style={style}
            ref={cardRef}
        >
            <p className="text-sm">혼잡도 상태</p>
            <p className="text-3xl font-bold mt-2">{status}</p>
        </motion.div>
    );
}
