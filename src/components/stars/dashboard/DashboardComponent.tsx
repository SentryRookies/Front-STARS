import { motion, useScroll } from "framer-motion";
import { useEffect, useRef, useMemo, useState } from "react";
import { usePlace } from "../../../context/PlaceContext";
import { CountUp } from "countup.js";
import VisitorCountCard from "./population/VisitorCountCard";
import AreaInfoCard from "./location/AreaInfoCard";
import WeatherCard from "./location/WeatherCard";
import ChartCard from "./population/ChartCard";
import POITableCard from "./POI/POITableCard";
import RatesCard from "./population/RatesCard";
import TrafficInfoCard from "./location/TrafficInfoCard";
import AccidentAlertCard from "./location/AccidentAlertCard";
import CongestionStatusCard from "./population/CongestionStatusCard";
import ClickInfoCard from "./POI/ClickInfoCard";
import AttractionTableCard from "./POI/AttractionCard";
import CulturalEventSlider from "./POI/CulturalEventSlider";
import { scrollToTop } from "../../../utils/scrollToTop";
import {
    getAreaList,
    getPlaceListByArea,
    subscribeWeatherUpdate,
} from "../../../api/starsApi";
import { MapData } from "../../../data/adminData";

// 타입 정의
interface Area {
    area_id: number;
    area_name: string;
    lat: number;
    lon: number;
    category: string;
    name_eng: string;
}
interface POI {
    name: string;
    address: string;
    tel: string;
    lon: number;
    lat: number;
    type: "cafe" | "restaurant" | "accommodation";
}
interface POIRawItem {
    name?: string;
    cafe_name?: string;
    address: string;
    phone?: string;
    lon: number;
    lat: number;
}
interface Attraction {
    name: string;
    address: string;
    phone?: string;
    homepage_url?: string;
    lat: number;
    lon: number;
}
interface CulturalEvent {
    name: string;
    address: string;
    category: string;
    target: string;
    start_date: string;
    end_date: string;
    event_fee?: string;
    event_img?: string;
    lat: number;
    lon: number;
}
interface WeatherForecast {
    fcst_dt: string;
    pre_temp: number;
    pre_precipitation: number;
    pre_precpt_type: string;
    pre_rain_chance: number;
    pre_sky_stts: string;
}
interface WeatherData {
    temp: number;
    precipitation: string;
    precpt_type: string;
    pcp_msg: string;
    sensible_temp: number;
    max_temp: number;
    min_temp: number;
    pm25: number;
    pm10: number;
    area_nm: string;
    weather_time: string;
    get_time: number;
    area_id: number;
    fcst24hours: WeatherForecast[];
}
type PlaceType =
    | "cafe"
    | "restaurant"
    | "accommodation"
    | "attraction"
    | "cultural_event";
interface PlaceListItem {
    type: PlaceType;
    content: unknown[];
}

// 유틸 함수
function isValidStatus(
    level: string | undefined
): level is "여유" | "보통" | "약간 붐빔" | "붐빔" {
    return ["여유", "보통", "약간 붐빔", "붐빔"].includes(level ?? "");
}

export default function DashboardComponent() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    useScroll({ container: containerRef });

    const {
        selectedAreaId,
        triggerCountUp,
        setTriggerCountUp,
        congestionInfo,
        mapData,
        accidentData,
    } = usePlace();

    // 상태
    const [areaName, setAreaName] = useState("");
    const [areaCategory, setAreaCategory] = useState("");
    const [areaEngName, setAreaEngName] = useState("");
    const [poiList, setPoiList] = useState<POI[]>([]);
    const [attractions, setAttractions] = useState<Attraction[]>([]);
    const [events, setEvents] = useState<CulturalEvent[]>([]);
    const [weatherList, setWeatherList] = useState<WeatherData[]>([]);
    const visitorCountRef = useRef<HTMLSpanElement | null>(null);
    const [currentEventIndex, setCurrentEventIndex] = useState(0);
    const attractionScrollRef = useRef<HTMLUListElement | null>(null);

    // 카드 스타일 및 ref
    const [cardStyles, setCardStyles] = useState<
        Record<number, { opacity: number; y: number; scale: number }>
    >({});
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    // 메모이제이션
    const cafePOIs = useMemo(
        () => poiList.filter((poi) => poi.type === "cafe"),
        [poiList]
    );
    const restaurantPOIs = useMemo(
        () => poiList.filter((poi) => poi.type === "restaurant"),
        [poiList]
    );
    const accommodationPOIs = useMemo(
        () => poiList.filter((poi) => poi.type === "accommodation"),
        [poiList]
    );
    const selectedAccidents = useMemo(
        () =>
            !selectedAreaId || !accidentData
                ? []
                : accidentData.filter((acc) => acc.area_id === selectedAreaId),
        [accidentData, selectedAreaId]
    );
    const map = useMemo(
        () => mapData?.find((m: MapData) => m.area_id === selectedAreaId),
        [mapData, selectedAreaId]
    );
    const forecastChartData = useMemo(() => {
        if (!congestionInfo?.fcst_ppltn) return [];
        return congestionInfo.fcst_ppltn.map((item) => {
            const avg = Math.round(
                (item.fcst_ppltn_min + item.fcst_ppltn_max) / 2
            );
            return {
                time: item.fcst_time.slice(11, 16),
                forecast: avg,
            };
        });
    }, [congestionInfo]);
    const selectedWeather = useMemo(() => {
        if (!selectedAreaId || weatherList.length === 0) return null;
        return weatherList.find((w) => w.area_id === selectedAreaId) ?? null;
    }, [selectedAreaId, weatherList]);

    // 데이터 구독 및 로딩
    useEffect(() => {
        const eventSource = subscribeWeatherUpdate((data) => {
            if (Array.isArray(data)) setWeatherList(data as WeatherData[]);
        });
        return () => eventSource.close();
    }, []);

    useEffect(() => {
        if (!selectedAreaId) return;
        getAreaList().then((areas: Area[]) => {
            const found = areas.find((a: Area) => a.area_id === selectedAreaId);
            if (found) {
                setAreaName(found.area_name);
                setAreaCategory(found.category);
                setAreaEngName(found.name_eng);
            }
        });
        getPlaceListByArea(selectedAreaId).then(
            (placeList: PlaceListItem[]) => {
                type POIType = "cafe" | "restaurant" | "accommodation";
                const poiTypes: POIType[] = [
                    "restaurant",
                    "cafe",
                    "accommodation",
                ];
                const pois: POI[] = placeList
                    .filter((p) => poiTypes.includes(p.type as POIType))
                    .flatMap((p) => {
                        const poiType = p.type as POIType;
                        const poiItems = p.content as POIRawItem[];
                        return poiItems.map((item) => ({
                            name: item.name || item.cafe_name || "이름 없음",
                            address: item.address,
                            tel: item.phone || "정보없음",
                            lon: item.lon,
                            lat: item.lat,
                            type: poiType,
                        }));
                    });
                setPoiList(pois);
                setAttractions(
                    (placeList.find((p) => p.type === "attraction")
                        ?.content as Attraction[]) ?? []
                );
                setEvents(
                    (placeList.find((p) => p.type === "cultural_event")
                        ?.content as CulturalEvent[]) ?? []
                );
            }
        );
    }, [selectedAreaId]);

    // CountUp 애니메이션
    useEffect(() => {
        if (
            triggerCountUp &&
            visitorCountRef.current &&
            congestionInfo?.area_ppltn_min &&
            congestionInfo?.area_ppltn_max
        ) {
            const avg = Math.round(
                (congestionInfo.area_ppltn_min +
                    congestionInfo.area_ppltn_max) /
                    2
            );
            const countUp = new CountUp(visitorCountRef.current, avg, {
                duration: 1.2,
                useEasing: true,
                separator: ",",
            });
            countUp.start();
            setTriggerCountUp(false);
        }
    }, [triggerCountUp, congestionInfo, setTriggerCountUp]);

    // 카드 스타일 업데이트
    useEffect(() => {
        const updateStyles = () => {
            if (!containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            const containerTop = containerRect.top;
            const containerBottom = containerRect.bottom;
            const fadeMargin = 50;
            const newStyles: Record<
                number,
                { opacity: number; y: number; scale: number }
            > = {};
            cardRefs.current.forEach((el, i) => {
                if (!el) return;
                const cardRect = el.getBoundingClientRect();
                const cardCenter = cardRect.top + cardRect.height / 2;
                if (
                    cardCenter >= containerTop + fadeMargin &&
                    cardCenter <= containerBottom - fadeMargin
                ) {
                    newStyles[i] = { opacity: 1, y: 0, scale: 1 };
                    return;
                }
                let y = 0;
                if (cardCenter < containerTop + fadeMargin) {
                    const ratio = (cardCenter - containerTop) / fadeMargin;
                    y = -15 * (1 - ratio);
                } else if (cardCenter > containerBottom - fadeMargin) {
                    const ratio = (containerBottom - cardCenter) / fadeMargin;
                    y = 15 * (1 - ratio);
                }
                newStyles[i] = { opacity: 1, y, scale: 1 };
            });
            setCardStyles(newStyles);
        };
        updateStyles();
        const interval = setInterval(updateStyles, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            ref={containerRef}
            className="h-screen w-full overflow-y-scroll bg-gray-100 text-black px-10 md:py-[120px] py-[100px]"
        >
            <motion.div className="max-w-[1000px] mx-auto grid grid-cols-12 gap-4">
                <AreaInfoCard
                    placeName={areaName}
                    category={areaCategory}
                    nameEng={areaEngName}
                    style={cardStyles[1]}
                    cardRef={(el) => (cardRefs.current[1] = el)}
                />

                <VisitorCountCard
                    refEl={visitorCountRef}
                    style={cardStyles[2]}
                    cardRef={(el) => (cardRefs.current[2] = el)}
                    status={
                        isValidStatus(congestionInfo?.area_congest_lvl)
                            ? congestionInfo.area_congest_lvl
                            : "보통"
                    }
                    congestionInfo={congestionInfo}
                />

                <CongestionStatusCard
                    status={
                        isValidStatus(congestionInfo?.area_congest_lvl)
                            ? congestionInfo.area_congest_lvl
                            : "보통"
                    }
                    style={cardStyles[3]}
                    cardRef={(el) => (cardRefs.current[3] = el)}
                />

                <WeatherCard
                    style={cardStyles[5]}
                    cardRef={(el) => (cardRefs.current[5] = el)}
                    weather={selectedWeather}
                />

                <ChartCard
                    data={forecastChartData}
                    style={cardStyles[6]}
                    cardRef={(el) => (cardRefs.current[6] = el)}
                />

                <RatesCard
                    style={cardStyles[7]}
                    cardRef={(el) => (cardRefs.current[7] = el)}
                />

                <AccidentAlertCard
                    style={cardStyles[8]}
                    cardRef={(el) => (cardRefs.current[8] = el)}
                    accidents={selectedAccidents}
                />

                <TrafficInfoCard
                    style={cardStyles[9]}
                    cardRef={(el) => (cardRefs.current[9] = el)}
                    mapData={map}
                    accidentData={selectedAccidents}
                />

                <ClickInfoCard
                    style={cardStyles[99]}
                    cardRef={(el) => (cardRefs.current[99] = el)}
                />

                <POITableCard
                    title="카페"
                    pois={cafePOIs}
                    style={cardStyles[300]}
                    cardRef={(el) => (cardRefs.current[300] = el)}
                />
                <POITableCard
                    title="식당"
                    pois={restaurantPOIs}
                    style={cardStyles[301]}
                    cardRef={(el) => (cardRefs.current[301] = el)}
                />
                <POITableCard
                    title="숙박업소"
                    pois={accommodationPOIs}
                    style={cardStyles[302]}
                    cardRef={(el) => (cardRefs.current[302] = el)}
                />

                <AttractionTableCard
                    attractions={attractions}
                    style={cardStyles[100]}
                    cardRef={(el) => (cardRefs.current[100] = el)}
                    scrollRef={attractionScrollRef}
                />

                <CulturalEventSlider
                    events={events}
                    style={cardStyles[400]}
                    cardRef={(el) => (cardRefs.current[400] = el)}
                    currentIndex={currentEventIndex}
                    setCurrentIndex={setCurrentEventIndex}
                />
            </motion.div>
            <div className="absolute top-8 right-8 z-10 justify-between flex gap-2">
                <div
                    className="bg-gray-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-medium rounded-2xl p-4 w-auto h-12 flex items-center justify-center text-lg shadow-lg transition cursor-pointer"
                    onClick={() => {
                        scrollToTop(containerRef.current);
                        setCurrentEventIndex(0);
                        attractionScrollRef.current?.scrollTo({
                            top: 0,
                            behavior: "smooth",
                        });
                        setTimeout(() => {
                            window.fullpage_api?.moveSectionUp();
                        }, 500);
                    }}
                >
                    맵으로 가기
                </div>
                <div
                    onClick={() => scrollToTop(containerRef.current)}
                    className="bg-indigo-600 hover:bg-gray-50 text-white hover:text-indigo-600 font-medium rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-lg transition cursor-pointer"
                    aria-label="최상단으로 이동"
                >
                    ↑
                </div>
            </div>
        </div>
    );
}
