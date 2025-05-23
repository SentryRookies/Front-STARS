// ✅ POITableCard.tsx
import { motion } from "framer-motion";

interface POI {
    name: string;
    address: string;
    tel: string;
}

interface POITableCardProps {
    title: string;
    pois: POI[];
    style: { opacity: number; y: number; scale: number };
    cardRef: (el: HTMLDivElement | null) => void;
}

export default function POITableCard({
    title,
    pois,
    style,
    cardRef,
}: POITableCardProps) {
    return (
        <motion.div
            className="col-span-12 sm:col-span-6 md:col-span-4 bg-white rounded-3xl shadow-lg p-4 my-2"
            whileHover={{ y: -6 }}
            animate={style}
            style={style}
            ref={cardRef}
        >
            <h3 className="text-lg font-bold text-gray-800 mb-3">{title}</h3>
            <ul className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-none rounded-xl">
                {pois.map((poi, idx) => (
                    <li
                        key={idx}
                        className="bg-gray-50 hover:bg-indigo-50 transition rounded-xl px-4 py-3 shadow-sm"
                    >
                        <p className="text-sm font-semibold text-gray-800 truncate">
                            📍 {poi.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                            {poi.address}
                        </p>
                        <p className="text-xs text-indigo-600 font-medium mt-1">
                            ☎ {poi.tel}
                        </p>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}
