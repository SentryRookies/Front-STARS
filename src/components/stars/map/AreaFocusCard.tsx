import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CountUp } from "countup.js";
import { getAreaList, getPlaceListByArea } from "../../../api/starsApi";
import { SearchResult } from "../../../api/searchApi";

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
    const visitorCountRef = useRef<HTMLSpanElement | null>(null);

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
        if (!show || !visitorCountRef.current) return;

        const countUp = new CountUp(
            visitorCountRef.current,
            Math.floor(Math.random() * 50000 + 5000),
            {
                duration: 1.5,
                useEasing: true,
                separator: ",",
            }
        );

        if (!countUp.error) countUp.start();
    }, [area, show]);

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
                    <div className="flex items-center justify-between">
                        <h3 className="md:text-xl text-lg text-gray-700 mr-2">
                            {area?.area_name} 방문자 수
                        </h3>
                        <span className="bg-indigo-100 text-indigo-700 inline-flex w-auto rounded-full m-1 md:text-base text-sm px-2 py-1 font-semibold whitespace-nowrap self-start">
                            #{area?.category}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                        {area?.name_eng}
                    </p>
                    <p className="md:text-5xl text-3xl font-bold text-gray-900">
                        <span ref={visitorCountRef}></span>명
                    </p>
                </motion.div>

                {/* 장소 요약 */}
                <motion.div
                    className="bg-indigo-500 text-white rounded-2xl shadow-2xl p-6 md:w-auto max-w-72 w-auto"
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
                                    <span className="capitalize font-medium">
                                        {typeLabelMap[type] ?? type}
                                    </span>
                                    <span
                                        className={`text-sm font-bold ${isDisabled ? "text-yellow-200" : "text-yellow-50"}`}
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
