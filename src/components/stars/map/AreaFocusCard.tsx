import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CountUp } from "countup.js";
import { getAreaList, getPlaceListByArea } from "../../../api/starsApi";
import { SearchResult } from "../../../api/searchApi";
import { usePlace } from "../../../context/PlaceContext";
import { WeatherData } from "../dashboard/location/WeatherCard";
import { Utensils, Coffee, BedDouble, Landmark, Ticket } from "lucide-react";

interface AreaFocusCardProps {
    areaId: number;
    show: boolean;
    onClose: () => void;
    onDetail: () => void;
    onCategoryClick?: (items: SearchResult[]) => void;
    weather: WeatherData | null;
}

interface AreaDetail {
    area_id: number;
    area_name: string;
    category: string;
    lat: number;
    lon: number;
    seoul_id: string;
    name_eng: string;
}

interface PlaceCategoryContent {
    type: string;
    content: PlaceContent[];
}

interface PlaceContent {
    id: string;
    name: string;
    address: string;
    lat: number;
    lon: number;
    phone?: string;
    kakaomap_url?: string;
}

const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            delay: i * 0.15,
            type: "spring",
            stiffness: 80,
        },
    }),
    exit: (i: number) => ({
        opacity: 0,
        y: 30,
        scale: 0.8,
        transition: {
            delay: i * 0.05,
            duration: 0.3,
            ease: "easeInOut",
        },
    }),
};

const AreaFocusCard: React.FC<AreaFocusCardProps> = ({
    areaId,
    show,
    onClose,
    onDetail,
    onCategoryClick,
    weather,
}) => {
    const [area, setArea] = useState<AreaDetail | null>(null);
    const [placeSummary, setPlaceSummary] = useState<Record<string, number>>(
        {}
    );
    const { congestionInfo } = usePlace();
    const visitorCountRef = useRef<HTMLSpanElement | null>(null);

    const iconMap: Record<string, React.ReactNode> = {
        restaurant: <Utensils size={16} />,
        cafe: <Coffee size={16} />,
        accommodation: <BedDouble size={16} />,
        attraction: <Landmark size={16} />,
        cultural_event: <Ticket size={16} />,
    };

    const typeLabelMap: Record<string, string> = {
        cafe: "카페",
        restaurant: "음식점",
        attraction: "관광명소",
        accommodation: "숙박",
        cultural_event: "문화행사",
    };

    useEffect(() => {
        if (!show || !areaId) return;

        getAreaList().then((areaList: AreaDetail[]) => {
            const selected = areaList.find((a) => a.area_id === Number(areaId));
            if (selected) setArea(selected);
        });

        getPlaceListByArea(areaId).then((placeList) => {
            const summary: Record<string, number> = {};

            (placeList as PlaceCategoryContent[]).forEach(
                (item: PlaceCategoryContent) => {
                    summary[item.type] = item.content.length;
                }
            );

            setPlaceSummary(summary);
        });
    }, [areaId, show]);

    useEffect(() => {
        if (!show || !visitorCountRef.current || !congestionInfo) return;
        const min = congestionInfo.area_ppltn_min;
        const max = congestionInfo.area_ppltn_max;
        if (!min || !max) return;
        const avg = Math.round((min + max) / 2);

        const countUp = new CountUp(visitorCountRef.current, avg, {
            duration: 1.5,
            useEasing: true,
            separator: ",",
        });
        countUp.start();
    }, [congestionInfo, show]);

    const handleCategoryClick = async (type: string) => {
        const placeList = await getPlaceListByArea(areaId);
        const categoryItem = (placeList as PlaceCategoryContent[]).find(
            (item: PlaceCategoryContent) => item.type === type
        );
        if (!categoryItem) return;

        const items: SearchResult[] = categoryItem.content.map(
            (place: PlaceContent) => ({
                place_id: Number(place.id), // string → number 변환
                name: place.name,
                address: place.address,
                lon: place.lon,
                lat: place.lat,
                phone: place.phone,
                kakaomap_url: place.kakaomap_url,
                type,
                area_id: areaId,
            })
        );
        onCategoryClick?.(items);
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="absolute inset-0 z-20 flex justify-center items-center"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <motion.div
                        className="absolute inset-0 bg-white/30 backdrop-blur-sm z-10"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    />

                    <motion.div
                        className="relative z-20 flex flex-col items-center gap-6 w-auto px-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <motion.div
                            className="flex flex-row sm:flex-row items-center justify-center gap-4"
                            variants={cardVariants}
                            custom={0}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {/* 방문자 수 카드 */}
                            <motion.div className="bg-white rounded-2xl shadow-lg p-4 max-w-96 sm:w-auto">
                                <h3 className="text-base sm:text-xl md:text-2xl font-semibold text-gray-900">
                                    {area?.area_name}
                                </h3>
                                <p className="text-lg sm:text-3xl font-bold text-gray-700">
                                    약 <span ref={visitorCountRef}></span>명
                                </p>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <span className="bg-indigo-100 text-indigo-700 inline-flex rounded-full text-xs sm:text-base px-2 py-1 font-semibold whitespace-nowrap">
                                        #{area?.category}
                                    </span>
                                    {congestionInfo?.area_congest_lvl && (
                                        <span className="inline-flex rounded-full text-xs sm:text-base px-2 py-1 font-semibold whitespace-nowrap bg-yellow-100 text-yellow-700">
                                            #혼잡도{" "}
                                            {congestionInfo.area_congest_lvl}
                                        </span>
                                    )}
                                </div>
                            </motion.div>

                            {/* 날씨 카드 */}
                            {weather && (
                                <motion.div className="bg-red-500 rounded-2xl shadow-lg px-6 py-4 flex flex-col items-center justify-center gap-2 w-fit">
                                    <div className="text-4xl sm:text-5xl">
                                        {weather.fcst24hours?.[0]
                                            ?.pre_sky_stts === "맑음"
                                            ? "☀️"
                                            : weather.fcst24hours?.[0]
                                                    ?.pre_sky_stts ===
                                                "구름많음"
                                              ? "⛅️"
                                              : "☁️"}
                                    </div>
                                    <p className="text-base sm:text-2xl font-bold text-white">
                                        {weather.temp}℃
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* 장소 요약 카드 */}
                        <motion.div
                            className="bg-indigo-500 text-white rounded-2xl shadow-2xl p-3 w-full max-w-[80%] sm:max-w-[16rem] md:max-w-[18rem]"
                            variants={cardVariants}
                            custom={1}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <h3 className="text-base sm:text-lg font-extrabold mb-3 tracking-tight">
                                장소 요약
                            </h3>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {Object.entries(placeSummary).map(
                                    ([type, count]: [string, number]) => {
                                        const isDisabled = count === 0;
                                        const Icon = iconMap[type];
                                        return (
                                            <div
                                                key={type}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm transition ${
                                                    isDisabled
                                                        ? "bg-white/0 text-indigo-400 cursor-not-allowed"
                                                        : "bg-white/10 text-white hover:bg-white/40 cursor-pointer"
                                                }`}
                                                onClick={() => {
                                                    if (!isDisabled)
                                                        handleCategoryClick(
                                                            type
                                                        );
                                                }}
                                                aria-disabled={isDisabled}
                                            >
                                                {Icon && <span>{Icon}</span>}
                                                <span className="capitalize font-medium text-xs sm:text-sm">
                                                    {typeLabelMap[type] ?? type}
                                                </span>
                                                <span className="text-xs font-bold">
                                                    {count}곳
                                                </span>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </motion.div>

                        {/* 버튼 */}
                        <motion.div
                            onClick={onDetail}
                            className="cursor-pointer bg-white rounded-2xl shadow-lg md:p-5 p-4 flex items-center justify-center md:text-4xl text-xl font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white"
                            variants={cardVariants}
                            custom={2}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            자세히 보기 ↓
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AreaFocusCard;
