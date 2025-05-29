import { motion } from "framer-motion";

interface ClickInfoProps {
    style: { opacity: number; y: number; scale: number };
    cardRef: (el: HTMLDivElement | null) => void;
}

export default function ClickInfoCard({ style, cardRef }: ClickInfoProps) {
    return (
        <motion.div
            className="col-span-12 bg-white text-gray-800 rounded-3xl shadow-lg p-4 text-center font-extrabold text-base"
            whileHover={{ y: -6 }}
            animate={
                style
                    ? { opacity: style.opacity, y: style.y, scale: style.scale }
                    : {}
            }
            style={style}
            ref={cardRef}
        >
            아래 카드들을 클릭하시면 지도에서 위치를 확인할 수 있어요 🗺️
        </motion.div>
    );
}
