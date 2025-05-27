import { motion, useScroll } from "framer-motion";
import { useEffect, useRef, useMemo, useState } from "react";
import { usePlace } from "../../../context/PlaceContext";
import { CountUp } from "countup.js";
import VisitorCountCard from "./VisitorCountCard";
import AreaInfoCard from "./AreaInfoCard";
import WeatherCard from "./WeatherCard";
import ChartCard from "./ChartCard";
import POITableCard from "./POITableCard";
import RatesCard from "./RatesCard";
import TrafficInfoCard from "./TrafficInfoCard";
// import ParkingInfoCard from "./ParkingInfoCard";
import AccidentAlertCard from "./AccidentAlertCard";
import CongestionStatusCard from "./CongestionStatusCard";
import AttractionTableCard from "./AttractionCard";
// import CulturalEventCard from "./CulturalEventCard";
import CulturalEventSlider from "./CulturalEventSlider";
import { scrollToTop } from "../../../utils/scrollToTop";

// API 호출
import {
    getAreaList,
    getPlaceListByArea,
    subscribeWeatherUpdate,
} from "../../../api/starsApi";
import { MapData } from "../../../data/adminData";

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
    } = usePlace();

    const [areaName, setAreaName] = useState("");
    const [areaCategory, setAreaCategory] = useState("");
    const [areaEngName, setAreaEngName] = useState("");

    const [poiList, setPoiList] = useState<POI[]>([]);
    const [attractions, setAttractions] = useState<Attraction[]>([]);
    const [events, setEvents] = useState<CulturalEvent[]>([]);

    const [weatherList, setWeatherList] = useState<WeatherData[]>([]);

    const { accidentData } = usePlace();

    const cafePOIs = poiList.filter((poi) => poi.type === "cafe");
    const restaurantPOIs = poiList.filter((poi) => poi.type === "restaurant");
    const accommodationPOIs = poiList.filter(
        (poi) => poi.type === "accommodation"
    );

    const selectedAccidents = useMemo(() => {
        if (!selectedAreaId || !accidentData) return [];
        return accidentData.filter((acc) => acc.area_id === selectedAreaId);
    }, [accidentData, selectedAreaId]);

    // 선택된 위치 교통 정보 찾기
    const map: MapData | undefined = mapData?.find(
        (map: MapData) => map.area_id === selectedAreaId
    );

    const visitorCountRef = useRef<HTMLSpanElement | null>(null);

    const forecastChartData = useMemo(() => {
        if (!congestionInfo?.fcst_ppltn) return [];

        return congestionInfo.fcst_ppltn.map((item) => {
            const avg = Math.round(
                (item.fcst_ppltn_min + item.fcst_ppltn_max) / 2
            );
            return {
                time: item.fcst_time.slice(11, 16), // '16:00' 형식
                forecast: avg,
            };
        });
    }, [congestionInfo]);

    useEffect(() => {
        const eventSource = subscribeWeatherUpdate((data) => {
            if (Array.isArray(data)) {
                setWeatherList(data as WeatherData[]);
            }
        });
        return () => eventSource.close();
    }, []);

    const selectedWeather = useMemo(() => {
        if (!selectedAreaId || weatherList.length === 0) return null;
        return weatherList.find((w) => w.area_id === selectedAreaId) ?? null;
    }, [selectedAreaId, weatherList]);

    // 관광특구 이름, 카테고리, 영문명 정보 가져오기
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
                    .filter((p) => poiTypes.includes(p.type as POIType)) // filter는 단순 확인만
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

                const attractionData =
                    (placeList.find((p) => p.type === "attraction")
                        ?.content as Attraction[]) ?? [];
                setAttractions(attractionData);

                const eventData =
                    (placeList.find((p) => p.type === "cultural_event")
                        ?.content as CulturalEvent[]) ?? [];
                setEvents(eventData);
            }
        );
    }, [selectedAreaId]);

    // 혼잡도 기반 CountUp 애니메이션 실행
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

    // const dummyPOIs = useMemo(
    //     () =>
    //         Array.from({ length: 30 }, (_, i) => ({
    //             name: `상권 ${i + 1}번`,
    //             address: `서울 중구 상권로 ${i + 1}길`,
    //             tel: `02-0000-00${String(i + 1).padStart(2, "0")}`,
    //         })),
    //     []
    // );

    const [cardStyles, setCardStyles] = useState<{
        [key: number]: { opacity: number; y: number; scale: number };
    }>({});
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const updateStyles = () => {
            if (!containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const containerTop = containerRect.top;
            const containerBottom = containerRect.bottom;
            const fadeMargin = 50;

            const newStyles: {
                [key: number]: { opacity: number; y: number; scale: number };
            } = {};

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

                const opacity = 1;
                let y = 0;
                const scale = 1;

                if (cardCenter < containerTop + fadeMargin) {
                    const ratio = (cardCenter - containerTop) / fadeMargin;
                    // opacity = Math.max(0, ratio);
                    // scale = Math.max(0, ratio);
                    y = -15 * (1 - ratio);
                } else if (cardCenter > containerBottom - fadeMargin) {
                    const ratio = (containerBottom - cardCenter) / fadeMargin;
                    // opacity = Math.max(0, ratio);
                    // scale = Math.max(0.8, ratio);
                    y = 15 * (1 - ratio);
                }

                newStyles[i] = { opacity, y, scale };
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
                {/*<ActionButton*/}
                {/*    style={cardStyles[0]}*/}
                {/*    cardRef={(el) => (cardRefs.current[0] = el)}*/}
                {/*/>*/}

                <AreaInfoCard
                    placeName={areaName} // ✅ 관광특구 이름
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

                {/*<PlaceImageCard*/}
                {/*    image={place.image}*/}
                {/*    style={cardStyles[4]}*/}
                {/*    cardRef={(el) => (cardRefs.current[4] = el)}*/}
                {/*/>*/}

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

                {/* 위치 보기 안내 멘트 */}
                <motion.div
                    className="col-span-12 bg-white text-gray-800 rounded-3xl shadow-lg p-4 text-center font-extrabold text-base"
                    whileHover={{ y: -6 }}
                    animate={cardStyles[99]}
                    style={cardStyles[99]}
                    ref={(el) => {
                        cardRefs.current[99] = el;
                    }}
                >
                    아래 카드들을 클릭하시면 지도에서 위치를 확인할 수 있어요 🗺️
                </motion.div>

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

                {/*<ParkingInfoCard*/}
                {/*    style={cardStyles[9]}*/}
                {/*    cardRef={(el) => (cardRefs.current[9] = el)}*/}
                {/*/>*/}

                {/*/!* 관광지 카드들 *!/*/}
                {/*{attractions.map((a, i) => (*/}
                {/*    <AttractionCard*/}
                {/*        key={i}*/}
                {/*        attraction={a}*/}
                {/*        style={cardStyles[100 + i]}*/}
                {/*        cardRef={(el) => (cardRefs.current[100 + i] = el)}*/}
                {/*    />*/}
                {/*))}*/}

                {/* 관광지 카드 - 리스트형 하나로 묶어서 출력 */}
                {attractions.length > 0 && (
                    <AttractionTableCard
                        attractions={attractions}
                        style={cardStyles[100]} // 인덱스는 하나만 사용
                        cardRef={(el) => (cardRefs.current[100] = el)}
                    />
                )}

                <CulturalEventSlider
                    events={events}
                    style={cardStyles[400]} // 적절한 인덱스 사용
                    cardRef={(el) => (cardRefs.current[400] = el)}
                />

                {/*/!* POI 카드들 *!/*/}
                {/*<POICardList*/}
                {/*    pois={poiList}*/}
                {/*    baseIndex={10}*/}
                {/*    cardRefs={cardRefs}*/}
                {/*    cardStyles={cardStyles}*/}
                {/*/>*/}

                {/*/!* 문화행사 카드들 *!/*/}
                {/*{events.map((e, i) => (*/}
                {/*    <CulturalEventCard*/}
                {/*        key={i}*/}
                {/*        event={e}*/}
                {/*        style={cardStyles[200 + i]}*/}
                {/*        cardRef={(el) => (cardRefs.current[200 + i] = el)}*/}
                {/*    />*/}
                {/*))}*/}
            </motion.div>
            <div className="absolute top-8 right-8 z-10 justify-between flex gap-2">
                <div
                    className="bg-gray-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-medium rounded-2xl p-4 w-auto h-12 flex items-center justify-center text-lg shadow-lg transition cursor-pointer"
                    onClick={() => {
                        scrollToTop(containerRef.current);
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
