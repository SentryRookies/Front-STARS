// src/context/AdminDataContext.tsx
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useMemo,
} from "react";
import { Navigate } from "react-router-dom";
import { subscribeCongestions, subscribeExternal } from "../api/starsApi";
import {
    PopulationData,
    TouristSpot,
    WeatherData,
    CombinedAreaData,
    AccidentData,
    TrafficData,
    ParkData,
    MapData,
} from "../data/adminData";
import { isAdmin } from "../slices/loginSlice";

// 컨텍스트에서 제공할 데이터 타입 정의
interface AdminDataContextType {
    touristInfoData: PopulationData[];
    touristSpotsData: TouristSpot[];
    weatherInfoData: WeatherData[];
    parkData: ParkData[];
    accidentData: AccidentData[];
    trafficData: TrafficData[];
    combinedAreaData: CombinedAreaData[];
    mapData: MapData[];
    findAreaData: (areaId: number) => CombinedAreaData | undefined;
    isLoading: boolean;
    error: string | null;
    refreshAllData: () => Promise<void>; // 새로고침, 근데 이걸 넘길 필요가 있나?
    refreshing: boolean;
}

// 기본값으로 사용할 컨텍스트 생성
const AdminDataContext = createContext<AdminDataContextType | undefined>(
    undefined
);

// 컨텍스트 제공자 Props 타입 정의
interface AdminDataProviderProps {
    children: ReactNode;
    test?: boolean; // 테스트 모드 여부 (더미 데이터 사용 시)
}

// 컨텍스트 제공자 컴포넌트
export const AdminDataProvider: React.FC<AdminDataProviderProps> = ({
    children,
    test = false,
}) => {
    // 관리자 권한 확인
    const adminCheck = isAdmin();

    // 데이터 상태 및 로딩 상태
    const [touristInfoData, setTouristInfoData] = useState<PopulationData[]>(
        []
    );
    const [touristSpotsData, setTouristSpotsData] = useState<TouristSpot[]>([]);
    const [weatherInfoData, setWeatherInfoData] = useState<WeatherData[]>([]);
    const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
    const [accidentData, setAccidentData] = useState<AccidentData[]>([]);
    const [parkData, setParkData] = useState<ParkData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    // const [spotsLoading, setSpotsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const eventSources = React.useRef<{
        congestionUpdate?: EventSource;
        congestionAlert?: EventSource;
        weatherUpdate?: EventSource;
        trafficUpdate?: EventSource;
        parkUpdate?: EventSource;
        accidentUpdate?: EventSource;
        congestions?: EventSource;
        externals?: EventSource;
    }>({});

    const combinedAreaData = useMemo<CombinedAreaData[]>(() => {
        // area_id를 기준으로 인구 데이터와 날씨 데이터 병합
        const combinedMap = new Map<number, CombinedAreaData>();

        // 인구 데이터 처리
        touristInfoData.forEach((populationData) => {
            const areaId = populationData.area_id;

            if (!combinedMap.has(areaId)) {
                combinedMap.set(areaId, {
                    area_id: areaId,
                    area_nm: populationData.area_nm,
                    population: null,
                    weather: null,
                });
            }

            const entry = combinedMap.get(areaId)!;
            entry.population = populationData;
        });

        // 날씨 데이터 처리
        weatherInfoData.forEach((weatherItem) => {
            const areaId = weatherItem.area_id;

            if (!combinedMap.has(areaId)) {
                combinedMap.set(areaId, {
                    area_id: areaId,
                    area_nm: weatherItem.area_nm,
                    population: null,
                    weather: null,
                });
            }

            const entry = combinedMap.get(areaId)!;
            entry.weather = weatherItem;
        });

        return Array.from(combinedMap.values());
    }, [touristInfoData, weatherInfoData]);

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

    // 지역 ID로 통합 데이터 조회 함수
    const findAreaData = (area_id: number): CombinedAreaData | undefined => {
        return combinedAreaData.find((data) => data.area_id === area_id);
    };

    // 혼잡 통합 SSE fetch
    const fetchCongestions = async () => {
        if (!adminCheck) return;
        setLoading(true);
        setError(null);

        try {
            // 기존 연결이 있으면 닫기
            if (eventSources.current.congestions) {
                eventSources.current.congestions.close();
            }

            // congestion-update 이벤트 처리 콜백
            const handleCongestionUpdate = (data: Record<string, unknown>) => {
                setTouristInfoData(data as unknown as PopulationData[]);

                if (error) {
                    setError(null);
                }
            };

            // congestion-alert 이벤트 처리 콜백
            const handleCongestionAlert = (data: Record<string, unknown>) => {
                setTouristSpotsData(data as unknown as TouristSpot[]);

                if (error) {
                    setError(null);
                }
            };

            // 두 콜백을 모두 전달
            const event: EventSource = subscribeCongestions(
                handleCongestionUpdate,
                handleCongestionAlert
            );

            // 연결 저장
            eventSources.current.congestions = event;
        } catch (err) {
            console.error(err);
            setTouristInfoData([]);
            setTouristSpotsData([]);
            setError("실시간 혼잡도 데이터 연결에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const fetchExternals = async () => {
        if (!adminCheck) return;
        setLoading(true);
        setError(null);

        try {
            if (eventSources.current.externals) {
                eventSources.current.externals.close();
            }
            const handelWeatherUpdate = (data: Record<string, unknown>) => {
                setWeatherInfoData(data as unknown as WeatherData[]);

                if (error) {
                    setError(null);
                }
            };
            const handelTrafficUpdate = (data: Record<string, unknown>) => {
                setTrafficData(data as unknown as TrafficData[]);

                if (error) {
                    setError(null);
                }
            };
            const handelParkUpdate = (data: Record<string, unknown>) => {
                setParkData(data as unknown as ParkData[]);

                if (error) {
                    setError(null);
                }
            };
            const handelAccidentUpdate = (data: Record<string, unknown>) => {
                setAccidentData(data as unknown as AccidentData[]);

                if (error) {
                    setError(null);
                }
            };
            const event = subscribeExternal(
                handelWeatherUpdate,
                handelTrafficUpdate,
                handelParkUpdate,
                handelAccidentUpdate
            );
            eventSources.current.externals = event;
        } catch (err) {
            console.error(err);
            setWeatherInfoData([]);
            setTrafficData([]);
            setParkData([]);
            setAccidentData([]);
        } finally {
            setLoading(false);
        }
    };

    // 모든 데이터 새로고침 함수
    const refreshAllData = async () => {
        if (!adminCheck) return Promise.resolve();

        setRefreshing(true);

        try {
            await Promise.all([fetchCongestions(), fetchExternals()]);
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }

        return Promise.resolve();
    };

    // 컴포넌트 마운트 시 데이터 로드 및 이벤트 소스 설정
    useEffect(() => {
        if (adminCheck) {
            fetchCongestions();
            fetchExternals();
        }

        // 컴포넌트 언마운트 시 정리
        return () => {
            // 모든 이벤트 소스 닫기
            Object.values(eventSources.current).forEach((source) => {
                if (source) source.close();
            });
        };
    }, [adminCheck]);

    // 컨텍스트 값
    const contextValue: AdminDataContextType = {
        touristInfoData,
        touristSpotsData,
        weatherInfoData,
        parkData,
        accidentData,
        trafficData,
        combinedAreaData,
        mapData,
        findAreaData,
        isLoading: loading,
        // weatherLoading,
        error,
        refreshAllData,
        refreshing,
    };

    // 관리자가 아닌 경우 로그인 페이지로 리다이렉트
    if (!adminCheck) {
        alert("관리자 로그인 후 시도하십시오");
        return <Navigate to="/login" replace />;
    }

    return (
        <AdminDataContext.Provider value={contextValue}>
            {children}
        </AdminDataContext.Provider>
    );
};

// 컨텍스트 사용을 위한 훅
export const useAdminData = (): AdminDataContextType => {
    const context = useContext(AdminDataContext);
    if (context === undefined) {
        throw new Error("useAdminData must be used within a AdminDataProvider");
    }
    return context;
};
