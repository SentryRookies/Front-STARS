// ✅ POITableCard.tsx
import { motion } from "framer-motion";
import { usePlace } from "../../../../context/PlaceContext";
import { SearchResult } from "../../../../api/searchApi";

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
            {pois.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-gray-500 py-8">
                    {/* SVG 아이콘 */}
                    <svg
                        className="w-20 h-20 fill-indigo-400"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z" />
                    </svg>
                    <p className="text-sm font-medium">
                        현재 이 관광특구에는
                        <br />
                        <span className="font-semibold text-gray-700">
                            {title}
                        </span>{" "}
                        정보가 없습니다.
                    </p>
                </div>
            ) : (
                <ul className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-none rounded-xl">
                    {pois.map((poi, idx) => (
                        <li
                            key={idx}
                            onClick={() => {
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
                                    place_id: idx + 1,
                                    name: poi.name,
                                    address: poi.address,
                                    phone: poi.tel,
                                    lon: poi.lon,
                                    lat: poi.lat,
                                    type: poi.type,
                                    area_id: selectedAreaId ?? undefined,
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
                            className="bg-gray-50 hover:bg-indigo-50 transition rounded-xl px-4 py-3 shadow-sm cursor-pointer"
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
            )}
        </motion.div>
    );
}
