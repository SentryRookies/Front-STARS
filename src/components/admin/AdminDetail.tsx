// Updated AdminDetail.tsx with always-rendered ForecastPopulationCard

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PieCard from "./cards/PieCard";
import AreaNameCard from "./cards/AreaNameCard";
import CongestionCard from "./cards/CongestionCard";
import AreaPopulationCard from "./cards/AreaPopulationCard";
import PopulationRateCard from "./cards/PopulationRateCard";
import ForecastPopulationCard from "./cards/ForecastPopulationCard";
import {
    ForecastPopulation,
    Data,
    PopulationData,
    CombinedAreaData,
    WeatherData,
} from "../../data/adminData";
import WeatherCard from "./cards/WeatherCard";
import AdminHeader from "./AdminHeader";
import { useAdminData } from "../../context/AdminContext";

const AdminDetail = () => {
    const location = useLocation();
    const spotData: CombinedAreaData = location.state?.combinedAreaData;

    const { touristInfoData, refreshAllData } = useAdminData();

    // 로컬 상태 관리
    const [gender, setGender] = useState<Data[]>([]);
    const [resnt, setResnt] = useState<Data[]>([]);
    const [ppltnRate, setPpltnRate] = useState<Data[]>([]);
    const [weather, setWeather] = useState<WeatherData | undefined>(); // Changed to array type
    const [forecastData, setForecastData] = useState<ForecastPopulation[]>([]);

    // 차트 데이터 처리
    useEffect(() => {
        if (spotData) {
            if (spotData.population) {
                processChartData(spotData.population);
                if (spotData.weather) {
                    setWeather(spotData.weather);
                }
                // Convert single weather object to array if it exists
            }
        }
    }, [spotData, touristInfoData]);

    // 차트 데이터 가공 함수
    const processChartData = (data: PopulationData) => {
        // 성별 비율 파싱
        setGender([
            {
                name: "남자",
                value: data.male_ppltn_rate,
                fill: "#1447e6",
            },
            {
                name: "여자",
                value: data.female_ppltn_rate,
                fill: "#f6339a",
            },
        ]);

        // 거주, 비거주 비율 파싱
        setResnt([
            {
                name: "거주자",
                value: data.resnt_ppltn_rate,
                fill: "#fcc800",
            },
            {
                name: "비거주자",
                value: data.non_resnt_ppltn_rate,
                fill: "#00a63e",
            },
        ]);

        // 연령별 분포 파싱
        setPpltnRate([
            {
                name: "10대>",
                value: data.ppltn_rates[0],
                fill: "#EB6927",
            },
            {
                name: "10대",
                value: data.ppltn_rates[1],
                fill: "#EB6927",
            },
            {
                name: "20대",
                value: data.ppltn_rates[2],
                fill: "#EB6927",
            },
            {
                name: "30대",
                value: data.ppltn_rates[3],
                fill: "#EB6927",
            },
            {
                name: "40대",
                value: data.ppltn_rates[4],
                fill: "#EB6927",
            },
            {
                name: "50대",
                value: data.ppltn_rates[5],
                fill: "#EB6927",
            },
            {
                name: "60대",
                value: data.ppltn_rates[6],
                fill: "#EB6927",
            },
            {
                name: "<70대",
                value: data.ppltn_rates[7],
                fill: "#EB6927",
            },
        ]);

        // 24시간 인구 추이 예측 파싱
        if (data.fcst_ppltn) {
            const forecastChartData = data.fcst_ppltn.map(
                (item: ForecastPopulation) => {
                    // 시간 포맷팅 (2025-04-18 17:00 -> 17:00)
                    const timeString = item.fcst_time.split(" ")[1];

                    return {
                        fcst_time: timeString,
                        fcst_ppltn_min: item.fcst_ppltn_min,
                        fcst_ppltn_max: item.fcst_ppltn_max,
                        fcst_congest_lvl: item.fcst_congest_lvl,
                    };
                }
            );
            setForecastData(forecastChartData);
        } else {
            // Make sure forecastData is set to an empty array if data.fcst_ppltn is undefined/null
            setForecastData([]);
        }
    };

    // 에러 메시지 컴포넌트
    const ErrorMessage = ({
        message,
        onRetry,
    }: {
        message: string;
        onRetry?: () => void;
    }) => (
        <div className="text-center p-6 max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">오류 발생</h2>
            <p className="text-gray-700 mb-6">{message}</p>
            {onRetry && (
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    onClick={onRetry}
                >
                    다시 시도
                </button>
            )}
        </div>
    );

    // 데이터가 없는 경우
    if (!spotData) {
        return (
            <div className="bg-gray-100 min-h-screen flex flex-col w-full">
                <AdminHeader path={"/manage"} />
                <div className="flex-grow flex items-center justify-center">
                    <ErrorMessage
                        message="데이터를 찾을 수 없습니다"
                        onRetry={() => refreshAllData()}
                    />
                </div>
            </div>
        );
    }

    // 메인 UI
    return (
        <div className="bg-gray-100 min-h-screen flex flex-col w-full">
            {/* Header */}
            <AdminHeader path={"/manage"} />
            {/* End of Header */}

            {/* Main Container*/}
            <div className="p-6 flex-grow">
                {/* 업데이트 인디케이터 */}
                {/*<UpdateIndicator />*/}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 첫 번째 행: 납작한 카드들 */}
                    <AreaNameCard
                        areaName={spotData.area_nm}
                        areaCode={spotData.population!.area_cd}
                    />

                    <AreaPopulationCard
                        population={{
                            area_ppltn_min: spotData.population!.area_ppltn_min,
                            area_ppltn_max: spotData.population!.area_ppltn_max,
                        }}
                    />

                    <CongestionCard
                        congestionLevel={spotData.population!.area_congest_lvl}
                    />

                    {/* 두 번째 행 이후: 기존 카드들 */}
                    <WeatherCard datas={weather} />

                    <PieCard datas={gender} name="남여 비율" />

                    <PieCard datas={resnt} name="거주자 비율" />

                    <PopulationRateCard population={ppltnRate} />

                    {/* Always render ForecastPopulationCard component */}
                    <ForecastPopulationCard
                        fcst_ppltn={forecastData}
                        className="md:col-span-2"
                    />
                </div>
            </div>
            {/* End of Main Container */}
        </div>
    );
};

export default AdminDetail;
