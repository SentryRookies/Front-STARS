// src/context/PlaceContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { subscribeCongestionUpdate, subscribeExternal } from "../api/starsApi";
import { MapData, ParkData, TrafficData } from "../data/adminData";

// 🔷 혼잡도 데이터 타입 정의
interface ForecastPopulation {
    fcst_time: string;
    fcst_congest_lvl: string;
    fcst_ppltn_min: number;
    fcst_ppltn_max: number;
}

interface CongestionData {
    area_id: number;
    area_nm: string;
    area_congest_lvl: string;
    area_congest_msg: string;
    area_ppltn_min: number;
    area_ppltn_max: number;
    ppltn_time: string;
    fcst_ppltn?: ForecastPopulation[]; // ✅ 추가
}

interface PlaceContextType {
    selectedPlace: string;
    setSelectedPlace: (placeId: string) => void;
    triggerCountUp: boolean;
    setTriggerCountUp: (value: boolean) => void;

    selectedAreaId: number | null; // ✅ number로 변경
    setSelectedAreaId: (areaId: number | null) => void; // ✅ 타입 일치

    congestionInfo: CongestionData | null;

    mapData: MapData[] | null;
}

const PlaceContext = createContext<PlaceContextType | undefined>(undefined);

export function PlaceProvider({ children }: { children: React.ReactNode }) {
    const [selectedPlace, setSelectedPlace] = useState<string>("");
    const [triggerCountUp, setTriggerCountUp] = useState<boolean>(false);

    const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null); // ✅ 수정

    const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
    const [parkData, setParkData] = useState<ParkData[]>([]);

    const [allCongestions, setAllCongestions] = useState<CongestionData[]>([]);
    const [congestionInfo, setCongestionInfo] = useState<CongestionData | null>(
        null
    );

    // ✅ SSE 연결
    useEffect(() => {
        const eventSource = subscribeCongestionUpdate((data) => {
            if (Array.isArray(data)) {
                setAllCongestions(data as CongestionData[]);
            }
        });

        const handelWeatherUpdate = (data: Record<string, unknown>) => {
            console.log("들어온 weather-update 데이터(사용안함): ", data);
        };
        const handelTrafficUpdate = (data: Record<string, unknown>) => {
            console.log("들어온 traffic-update 데이터: ", data);
            setTrafficData(data as unknown as TrafficData[]);
        };
        const handelParkUpdate = (data: Record<string, unknown>) => {
            console.log("들어온 park-update 데이터: ", data);
            setParkData(data as unknown as ParkData[]);
        };
        const handelAccidentUpdate = (data: Record<string, unknown>) => {
            console.log("들어온 accident-update 데이터(사용안함): ", data);
        };
        const event = subscribeExternal(
            handelWeatherUpdate,
            handelTrafficUpdate,
            handelParkUpdate,
            handelAccidentUpdate
        );

        return () => {
            eventSource.close();
            event.close();
        };
    }, []);

    const mapData = useMemo<MapData[]>(() => {
        const combinedMap = new Map<number, MapData>();
        trafficData.forEach((traffic) => {
            const areaId = traffic.area_id;

            if (!combinedMap.has(areaId)) {
                combinedMap.set(areaId, {
                    area_id: areaId,
                    area_nm: traffic.area_nm,
                    trafficData: null,
                    parkData: null,
                });
            }
            const entry = combinedMap.get(areaId)!;
            entry.trafficData = traffic;
        });

        parkData.forEach((park) => {
            const areaId = park.area_id;

            if (!combinedMap.has(areaId)) {
                combinedMap.set(areaId, {
                    area_id: areaId,
                    area_nm: park.area_nm,
                    trafficData: null,
                    parkData: null,
                });
            }
            const entry = combinedMap.get(areaId)!;
            entry.parkData = park;
        });
        return Array.from(combinedMap.values());
    }, [parkData, trafficData]);

    // ✅ selectedAreaId에 맞는 혼잡도 추출
    useEffect(() => {
        if (!selectedAreaId || allCongestions.length === 0) {
            setCongestionInfo(null);
            return;
        }

        const matched = allCongestions.find(
            (c) => c.area_id === selectedAreaId
        );
        setCongestionInfo(matched ?? null);
    }, [selectedAreaId, allCongestions]);

    return (
        <PlaceContext.Provider
            value={{
                selectedPlace,
                setSelectedPlace,
                triggerCountUp,
                setTriggerCountUp,
                selectedAreaId,
                setSelectedAreaId,
                congestionInfo,
                mapData,
            }}
        >
            {children}
        </PlaceContext.Provider>
    );
}

export function usePlace() {
    const context = useContext(PlaceContext);
    if (!context) {
        throw new Error("usePlace must be used within a PlaceProvider");
    }
    return context;
}
