import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CountUp } from "countup.js";
import { getAreaList, getPlaceListByArea } from "../../../api/starsApi";
import { SearchResult } from "../../../api/searchApi";
import { usePlace } from "../../../context/PlaceContext";

interface AreaFocusCardProps {
    areaId: number;
    show: boolean;
    onClose: () => void;
    onDetail: () => void;
    onCategoryClick?: (items: SearchResult[]) => void;
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
    phone?: string; // 추가
    kakaomap_url?: string; // 추가
}

const AreaFocusCard: React.FC<AreaFocusCardProps> = ({
    areaId,
    show,
    onClose,
    onDetail,
    onCategoryClick,
}) => {
    const [area, setArea] = useState<AreaDetail | null>(null);
    const [placeSummary, setPlaceSummary] = useState<Record<string, number>>(
        {}
    );
    const { congestionInfo } = usePlace();
    console.log("AreaFocusCard congestionInfo:", congestionInfo);
    const visitorCountRef = useRef<HTMLSpanElement | null>(null);

    useEffect(() => {
        if (!visitorCountRef.current || !congestionInfo) return;
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
    }, [congestionInfo]);

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

        getPlaceListByArea(areaId).then((placeList: PlaceCategoryContent[]) => {
            const summary: Record<string, number> = {};
            placeList.forEach((item) => {
                summary[item.type] = item.content.length;
            });
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
        const categoryItem = placeList.find(
            (item: PlaceCategoryContent) => item.type === type
        );
        if (!categoryItem) return;

        const items: SearchResult[] = categoryItem.content.map(
            (place: PlaceContent) => ({
                place_id: place.id,
                name: place.name,
                address: place.address,
                lon: place.lon,
                lat: place.lat,
                phone: place.phone,
                kakaomap_url: place.kakaomap_url,
                type,
                area_id: areaId, // 추가
            })
        );
        onCategoryClick?.(items);
    };

    return (
        <div
            className={`absolute inset-0 z-20 flex justify-center items-center transition-opacity duration-500 ${
                show
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
            }`}
        >
            <div
                className="absolute inset-0 z-10 bg-white/30 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* 안내 메시지 */}
            <div
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-auto min-w-60 max-w-xs flex items-center cursor-pointer z-20"
                onClick={onClose}
            >
                <motion.div
                    className="flex ml-1 md:p-4 p-3 space-x-4 bg-white text-green-500 rounded-2xl shadow-xl"
                    role="alert"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        repeatDelay: 1,
                    }}
                >
                    {/* Content */}
                    <svg
                        className="w-5 h-5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                    </svg>
                    <div className="md:text-sm text-xs font-bold text-gray-500 flex items-center">
                        <span className="hidden md:inline">
                            돌아가시려면 화면 밖을 클릭해 주세요.
                        </span>
                        <span className="md:hidden">
                            돌아가시려면 여기를 터치해 주세요.
                        </span>
                    </div>
                </motion.div>
            </div>

            <div
                className="relative z-20 flex flex-col items-center gap-6 w-auto px-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 방문자 수 */}
                <motion.div
                    className="bg-white rounded-2xl shadow-lg p-4 md:w-auto max-w-96 w-4/5"
                    whileHover={{ y: -8 }}
                >
                    <div className="flex justify-between w-full">
                        {/* 왼쪽 영역: 방문자 수 및 영어 제목 */}
                        <div className="flex flex-col justify-start mt-1">
                            <h3 className="md:text-2xl text-lg font-semibold text-gray-700">
                                {area?.area_name}
                            </h3>
                            <p className="md:text-base text-sm text-gray-500">
                                {area?.name_eng}
                            </p>
                        </div>

                        {/* 오른쪽 영역: 카테고리 및 혼잡도 */}
                        <div className="flex flex-col items-end md:ml-4 ml-2">
                            <span className="bg-indigo-100 text-indigo-700 inline-flex w-auto rounded-full m-1 md:text-base text-sm px-2 py-1 font-semibold whitespace-nowrap self-end">
                                #{area?.category}
                            </span>
                            {congestionInfo?.area_congest_lvl && (
                                <span
                                    className={[
                                        "inline-flex w-auto rounded-full m-1 md:text-base text-sm px-2 py-1 font-semibold whitespace-nowrap self-end",
                                        congestionInfo.area_congest_lvl ===
                                        "여유"
                                            ? "bg-green-100 text-green-700"
                                            : congestionInfo.area_congest_lvl ===
                                                "보통"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : congestionInfo.area_congest_lvl ===
                                                  "약간 붐빔"
                                                ? "bg-orange-100 text-orange-700"
                                                : "bg-red-100 text-red-700",
                                    ].join(" ")}
                                >
                                    #혼잡도 {congestionInfo.area_congest_lvl}
                                </span>
                            )}
                        </div>
                    </div>
                    <p className="md:text-4xl text-2xl font-bold text-gray-900">
                        약 <span ref={visitorCountRef}></span>명
                    </p>
                </motion.div>

                {/* 장소 요약 */}
                <motion.div
                    className="bg-indigo-500 text-white rounded-2xl shadow-2xl p-4 md:w-auto max-w-72 w-auto"
                    whileHover={{ y: -8 }}
                >
                    <h3 className="text-xl font-extrabold mb-4 tracking-tight">
                        장소 요약
                    </h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {Object.entries(placeSummary).map(([type, count]) => {
                            const isDisabled = count === 0;

                            return (
                                <div
                                    key={type}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full shadow cursor-pointer transition
                                        ${
                                            isDisabled
                                                ? "bg-white/10 text-gray-300 cursor-not-allowed"
                                                : "bg-white/30 text-white hover:bg-white/30"
                                        }
                                    `}
                                    onClick={() => {
                                        if (!isDisabled)
                                            handleCategoryClick(type);
                                    }}
                                    aria-disabled={isDisabled}
                                >
                                    <span className="capitalize font-medium md:text-base text-sm">
                                        {typeLabelMap[type] ?? type}
                                    </span>
                                    <span
                                        className={`text-sm font-bold ${isDisabled ? "text-gray-300" : "text-white"}`}
                                    >
                                        {count}곳
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* 버튼 */}
                <motion.div
                    onClick={onDetail}
                    className="cursor-pointer bg-white rounded-2xl shadow-lg md:p-5 p-4 flex items-center justify-center md:text-4xl text-xl font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white"
                    whileHover={{ y: -8 }}
                >
                    자세히 보기 ↓
                </motion.div>
            </div>
        </div>
    );
};

export default AreaFocusCard;
