import { motion } from "framer-motion";

interface PlaceInfoCardProps {
    placeName: string;
    category: string;
    nameEng: string;
    style: { opacity: number; y: number; scale: number };
    cardRef: (el: HTMLDivElement | null) => void;
}

export default function AreaInfoCard({
    placeName,
    category,
    nameEng,
    style,
    cardRef,
}: PlaceInfoCardProps) {
    return (
        <motion.div
            className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-5 bg-white rounded-3xl shadow-lg p-4 my-2"
            whileHover={{ y: -6 }}
            animate={
                style
                    ? { opacity: style.opacity, y: style.y, scale: style.scale }
                    : {}
            }
            style={style}
            ref={cardRef}
        >
            <p className="text-sm text-gray-500">{category}</p>
            <p className="text-3xl font-bold mt-2">{placeName}</p>
            <p className="text-sm text-gray-500 mt-2">{nameEng}</p>
        </motion.div>
    );
}
