import { motion } from "framer-motion";

interface POI {
    name: string;
    address: string;
    tel: string;
}

interface POICardListProps {
    pois: POI[];
    baseIndex: number;
    cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
    cardStyles: {
        [key: number]: { opacity: number; y: number; scale: number };
    };
}

export default function POICardList({
    pois,
    baseIndex,
    cardRefs,
    cardStyles,
}: POICardListProps) {
    return (
        <motion.div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4 my-2">
            {pois.map((poi, idx) => (
                <motion.div
                    key={idx}
                    className="bg-white rounded-3xl shadow-lg p-4 my-2"
                    whileHover={{ y: -6 }}
                    animate={cardStyles[baseIndex + idx]}
                    style={cardStyles[baseIndex + idx]}
                    ref={(el) => {
                        cardRefs.current[baseIndex + idx] = el;
                    }}
                >
                    <p className="text-md font-bold">{poi.name}</p>
                    <p className="text-sm text-gray-500">{poi.address}</p>
                    <p className="text-sm text-gray-700 mt-1">☎ {poi.tel}</p>
                </motion.div>
            ))}
        </motion.div>
    );
}
