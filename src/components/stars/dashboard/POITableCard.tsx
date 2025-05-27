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
            {pois.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-gray-500 py-8">
                    {/* SVG 아이콘 */}
                    <svg
                        fill="#7c86ff"
                        width="80px"
                        height="80px"
                        viewBox="-1 0 19 19"
                        xmlns="http://www.w3.org/2000/svg"
                        className="cf-icon-svg"
                    >
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g
                            id="SVGRepo_tracerCarrier"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                            <path d="M16.417 9.583A7.917 7.917 0 1 1 8.5 1.666a7.917 7.917 0 0 1 7.917 7.917zm-5.267 6.274a6.766 6.766 0 0 0 1.756-1.084L3.31 5.177a6.81 6.81 0 0 0 7.84 10.68zm3.624-3.624a6.808 6.808 0 0 0-10.68-7.84l9.596 9.596a6.77 6.77 0 0 0 1.084-1.756z"></path>
                        </g>
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
