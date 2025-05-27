// ✅ POITableCard.tsx
import { motion } from "framer-motion";
import { usePlace } from "../../../context/PlaceContext";
import { SearchResult } from "../../../api/searchApi";

interface POI {
    name: string;
    address: string;
    tel: string;
    lon: number;
    lat: number;
    type: "restaurant" | "cafe" | "accommodation";
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
    const { selectedAreaId, setHighlightPOI } = usePlace();

    return (
        <motion.div
            className="col-span-12 sm:col-span-6 md:col-span-4 bg-white rounded-3xl shadow-lg p-4 my-2"
            whileHover={{ y: -6 }}
            animate={style}
            style={style}
            ref={cardRef}
        >
            <h3 className="text-lg font-bold text-indigo-600 mb-3">{title}</h3>
            <ul className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-none rounded-xl">
                {pois.map((poi, idx) => (
                    <li
                        key={idx}
                        onClick={() => {
                            // 좌표 유효성 체크
                            if (
                                !poi.lon ||
                                !poi.lat ||
                                isNaN(poi.lon) ||
                                isNaN(poi.lat)
                            ) {
                                console.warn("Invalid POI location:", poi);
                                return;
                            }

                            const poiForMap: SearchResult = {
                                place_id: idx + 1, // ID가 없다면 유니크한 값 필요
                                name: poi.name,
                                address: poi.address,
                                phone: poi.tel,
                                lon: poi.lon,
                                lat: poi.lat,
                                type: poi.type,
                                area_id: selectedAreaId ?? undefined, // 필요 시
                            };
                            setHighlightPOI(poiForMap);
                            (
                                window as unknown as {
                                    fullpage_api?: {
                                        moveTo: (n: number) => void;
                                    };
                                }
                            ).fullpage_api?.moveTo(1);
                        }}
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
