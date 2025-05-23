import { motion } from "framer-motion";

interface Attraction {
    name: string;
    address: string;
    phone?: string;
    homepage_url?: string;
}

interface AttractionTableCardProps {
    attractions: Attraction[];
    style: { opacity: number; y: number; scale: number };
    cardRef: (el: HTMLDivElement | null) => void;
}

export default function AttractionTableCard({
    attractions,
    style,
    cardRef,
}: AttractionTableCardProps) {
    return (
        <motion.div
            className="col-span-12 md:col-span-6 bg-white rounded-3xl shadow-lg p-4 my-2"
            whileHover={{ y: -6 }}
            animate={style}
            style={style}
            ref={cardRef}
        >
            <h3 className="text-lg font-bold text-orange-500 mb-3">
                관광지 목록
            </h3>

            <ul className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-none rounded-xl">
                {attractions.map((a, idx) => (
                    <li
                        key={idx}
                        className="p-3 rounded-xl bg-gray-50 hover:bg-orange-50 shadow-sm transition"
                    >
                        <p className="text-sm font-semibold text-gray-800">
                            {a.name}
                        </p>
                        <p className="text-xs text-gray-500">{a.address}</p>
                        {a.phone && (
                            <p className="text-xs text-gray-500">
                                ☎ {a.phone}
                            </p>
                        )}
                        {a.homepage_url && (
                            <a
                                href={`https://${a.homepage_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-2 px-4 py-1 text-xs text-white hover:text-white bg-orange-500 rounded-lg shadow hover:bg-orange-600 transition"
                            >
                                홈페이지 방문
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}
