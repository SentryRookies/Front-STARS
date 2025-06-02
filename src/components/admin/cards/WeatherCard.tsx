import React from "react";
import {
    Sun,
    Cloud,
    CloudRain,
    Snowflake,
    CloudDrizzle,
    Cloudy,
} from "lucide-react";

interface WeatherData {
    temp: number;
    sensible_temp: number;
    min_temp: number;
    max_temp: number;
    pm10: number;
    pm25: number;
    weather_time: string;
    fcst24hours: Array<{
        fcst_dt: string;
        pre_sky_stts: string;
        pre_temp: number;
        pre_rain_chance: number;
    }>;
}

interface WeatherCardProps {
    datas: WeatherData | undefined;
}

// Helper function to get background gradient based on temperature
const getTempGradient = (temp: number): string => {
    if (temp >= 30) return "bg-gradient-to-br from-red-500/75 to-orange-600/75";
    if (temp >= 25)
        return "bg-gradient-to-br from-orange-500/75 to-amber-500/75";
    if (temp >= 20)
        return "bg-gradient-to-br from-amber-400/75 to-yellow-400/75";
    if (temp >= 15) return "bg-gradient-to-br from-sky-400/75 to-blue-400/75";
    if (temp >= 10)
        return "bg-gradient-to-br from-blue-500/75 to-indigo-500/75";
    return "bg-gradient-to-br from-indigo-600/75 to-blue-700/75";
};

// Helper function to get weather icon component based on sky status
const getWeatherIcon = (skyStatus: string, size: number = 28) => {
    const shadowClass = "drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]";

    switch (skyStatus) {
        case "맑음":
            return (
                <Sun
                    size={size}
                    strokeWidth={3}
                    color="#ffffff"
                    className={shadowClass}
                />
            );
        case "구름조금":
            return (
                <Cloudy
                    size={size}
                    strokeWidth={3}
                    color="#ffffff"
                    className={shadowClass}
                />
            );
        case "구름많음":
            return (
                <Cloud
                    size={size}
                    strokeWidth={3}
                    color="#ffffff"
                    className={shadowClass}
                />
            );
        case "흐림":
            return (
                <Cloud
                    size={size}
                    strokeWidth={3}
                    color="#ffffff"
                    className={shadowClass}
                />
            );
        case "비":
            return (
                <CloudRain
                    size={size}
                    strokeWidth={3}
                    color="#ffffff"
                    className={shadowClass}
                />
            );
        case "눈":
            return (
                <Snowflake
                    size={size}
                    strokeWidth={3}
                    color="#ffffff"
                    className={shadowClass}
                />
            );
        default:
            return (
                <Cloud
                    size={size}
                    strokeWidth={3}
                    color="#ffffff"
                    className={shadowClass}
                />
            );
    }
};

// Helper function to get PM10 (fine dust) status
const getPM10Status = (pm10: number): { text: string; color: string } => {
    if (pm10 <= 30) return { text: "좋음", color: "text-emerald-700" };
    if (pm10 <= 80) return { text: "보통", color: "text-sky-700" };
    if (pm10 <= 150) return { text: "나쁨", color: "text-amber-700" };
    return { text: "매우나쁨", color: "text-red-700" };
};

// Helper function to get PM2.5 (ultra fine dust) status
const getPM25Status = (pm25: number): { text: string; color: string } => {
    if (pm25 <= 15) return { text: "좋음", color: "text-emerald-700" };
    if (pm25 <= 35) return { text: "보통", color: "text-sky-700" };
    if (pm25 <= 75) return { text: "나쁨", color: "text-amber-700" };
    return { text: "매우나쁨", color: "text-red-700" };
};

// Format time from "202505141700" to "17:00"
const formatForecastTime = (timeString: string): string => {
    return `${timeString.slice(8, 10)}:${timeString.slice(10, 12)}`;
};

// WeatherCard component
const WeatherCard = ({ datas }: WeatherCardProps) => {
    // 샘플 데이터 (실제 props가 없는 경우)
    const sampleData: WeatherData = {
        temp: 23,
        sensible_temp: 25,
        min_temp: 18,
        max_temp: 28,
        pm10: 45,
        pm25: 25,
        weather_time: "2025-05-22 15:00",
        fcst24hours: [
            {
                fcst_dt: "202505221500",
                pre_sky_stts: "맑음",
                pre_temp: 23,
                pre_rain_chance: 0,
            },
            {
                fcst_dt: "202505221600",
                pre_sky_stts: "구름조금",
                pre_temp: 24,
                pre_rain_chance: 10,
            },
            {
                fcst_dt: "202505221700",
                pre_sky_stts: "구름많음",
                pre_temp: 25,
                pre_rain_chance: 20,
            },
            {
                fcst_dt: "202505221800",
                pre_sky_stts: "흐림",
                pre_temp: 24,
                pre_rain_chance: 30,
            },
            {
                fcst_dt: "202505221900",
                pre_sky_stts: "비",
                pre_temp: 22,
                pre_rain_chance: 80,
            },
        ],
    };

    const weatherData = datas || sampleData;

    // If no data, show "No data" message
    if (!weatherData) {
        return (
            <div className="bg-white p-4 rounded-lg border border-gray-200 h-full flex flex-col justify-center items-center">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-indigo-500 rounded"></div>
                    <h3 className="text-lg font-bold text-gray-900">
                        날씨 정보
                    </h3>
                </div>
                <div className="flex flex-col items-center">
                    <Cloud className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-600 text-center font-medium text-sm">
                        날씨 데이터가 없습니다
                    </p>
                </div>
            </div>
        );
    }

    // Check for forecast data
    const hasForecast =
        weatherData &&
        weatherData.fcst24hours &&
        Array.isArray(weatherData.fcst24hours) &&
        weatherData.fcst24hours.length > 0;

    // Get forecasts (limited to first 6 for display)
    const forecastItems = hasForecast
        ? weatherData.fcst24hours.slice(0, 5)
        : [];

    // Get air quality info
    const pm10 =
        weatherData && typeof weatherData.pm10 === "number"
            ? weatherData.pm10
            : 0;
    const pm25 =
        weatherData && typeof weatherData.pm25 === "number"
            ? weatherData.pm25
            : 0;
    const pm10Status = getPM10Status(pm10);
    const pm25Status = getPM25Status(pm25);

    // Get temperature-based styling
    const tempGradient = getTempGradient(weatherData?.temp || 20);

    return (
        <div
            className={`${tempGradient} p-4 rounded-lg h-full flex flex-col border border-white/20 shadow-lg backdrop-blur-sm`}
        >
            {/* Header section with accent bar */}
            <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-white/90 rounded shadow-sm"></div>
                <h3 className="text-lg font-bold text-white drop-shadow-lg">
                    날씨 정보
                </h3>
            </div>

            {/* Current temperature and conditions */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-3xl font-extrabold text-white drop-shadow-lg">
                        {weatherData?.temp || "?"}°C
                    </p>
                    <p className="text-xs text-white font-semibold drop-shadow-md">
                        체감 {weatherData?.sensible_temp || "?"}°C
                    </p>
                </div>
                <div className="text-right flex flex-col items-center">
                    <div className="mb-1">
                        {hasForecast
                            ? getWeatherIcon(
                                  forecastItems[0]?.pre_sky_stts || "흐림",
                                  32
                              )
                            : getWeatherIcon("흐림", 32)}
                    </div>
                    <p className="text-xs text-white font-bold drop-shadow-md">
                        {hasForecast
                            ? forecastItems[0]?.pre_sky_stts || "정보 없음"
                            : "정보 없음"}
                    </p>
                </div>
            </div>

            {/* Min/Max temperature */}
            <div className="flex justify-between text-xs text-white mb-3 font-semibold drop-shadow-md">
                <span>최저 {weatherData?.min_temp || "?"}°C</span>
                <span>최고 {weatherData?.max_temp || "?"}°C</span>
            </div>

            {/* Air quality */}
            <div className="bg-white/95 rounded-md p-2 mb-3 text-xs border border-white/50 backdrop-blur-sm shadow-md">
                <div className="flex justify-between mb-1">
                    <span className="text-slate-800 font-semibold">
                        미세먼지
                    </span>
                    <span className={`font-bold ${pm10Status.color}`}>
                        {pm10Status.text} ({pm10})
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-800 font-semibold">
                        초미세먼지
                    </span>
                    <span className={`font-bold ${pm25Status.color}`}>
                        {pm25Status.text} ({pm25})
                    </span>
                </div>
            </div>

            {/* Forecast section */}
            {hasForecast && (
                <div className="mt-auto pt-2 border-t border-white/50">
                    <div className="flex justify-between">
                        {forecastItems.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col items-center"
                            >
                                <span className="text-xs text-white font-semibold drop-shadow-md">
                                    {formatForecastTime(item.fcst_dt)}
                                </span>
                                <div className="my-1">
                                    {getWeatherIcon(item.pre_sky_stts, 18)}
                                </div>
                                <span className="text-xs text-white font-bold drop-shadow-md">
                                    {item.pre_temp}°
                                </span>
                                {item.pre_rain_chance > 0 && (
                                    <span className="text-xs mt-0.5 text-cyan-100 font-bold drop-shadow-md">
                                        {item.pre_rain_chance}%
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Update time */}
            <div className="text-right text-xs text-white/95 mt-2 font-semibold drop-shadow-md">
                {weatherData?.weather_time || "업데이트 시간 정보 없음"} 기준
            </div>
        </div>
    );
};

export default WeatherCard;
