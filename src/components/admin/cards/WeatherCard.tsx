import React from "react";
import { WeatherData } from "../../../data/adminData";

interface WeatherCardProps {
    datas: WeatherData | undefined;
}

// Helper function to get background gradient based on temperature
const getTempGradient = (temp: number): string => {
    if (temp >= 30) return "bg-gradient-to-r from-red-500/60 to-orange-400/60";
    if (temp >= 25)
        return "bg-gradient-to-r from-orange-400/60 to-yellow-300/60";
    if (temp >= 20)
        return "bg-gradient-to-r from-yellow-300/60 to-yellow-200/60";
    if (temp >= 15) return "bg-gradient-to-r from-blue-300/60 to-blue-200/60";
    if (temp >= 10) return "bg-gradient-to-r from-blue-400/60 to-blue-300/60";
    return "bg-gradient-to-r from-blue-600/60 to-blue-400/60";
};

// Helper function to get weather icon based on sky status
const getWeatherIcon = (skyStatus: string): string => {
    switch (skyStatus) {
        case "맑음":
            return "☀️";
        case "구름조금":
            return "🌤️";
        case "구름많음":
            return "⛅";
        case "흐림":
            return "☁️";
        case "비":
            return "🌧️";
        case "눈":
            return "❄️";
        default:
            return "☁️";
    }
};

// Helper function to get PM10 (fine dust) status
const getPM10Status = (pm10: number): { text: string; color: string } => {
    if (pm10 <= 30) return { text: "좋음", color: "text-green-600" };
    if (pm10 <= 80) return { text: "보통", color: "text-blue-600" };
    if (pm10 <= 150) return { text: "나쁨", color: "text-orange-600" };
    return { text: "매우나쁨", color: "text-red-600" };
};

// Helper function to get PM2.5 (ultra fine dust) status
const getPM25Status = (pm25: number): { text: string; color: string } => {
    if (pm25 <= 15) return { text: "좋음", color: "text-green-600" };
    if (pm25 <= 35) return { text: "보통", color: "text-blue-600" };
    if (pm25 <= 75) return { text: "나쁨", color: "text-orange-600" };
    return { text: "매우나쁨", color: "text-red-600" };
};

// Format time from "202505141700" to "17:00"
const formatForecastTime = (timeString: string): string => {
    return `${timeString.slice(8, 10)}:${timeString.slice(10, 12)}`;
};

// WeatherCard component
const WeatherCard = ({ datas }: WeatherCardProps) => {
    // If no data, show "No data" message
    if (!datas) {
        return (
            <div className="bg-white p-4 rounded-lg h-full flex flex-col justify-center items-center">
                <h3 className="font-semibold text-lg text-gray-700 mb-2">
                    날씨 정보
                </h3>
                <div className="flex flex-col items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-gray-300 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                        />
                    </svg>
                    <p className="text-gray-500 text-center">
                        날씨 데이터가 없습니다
                    </p>
                </div>
            </div>
        );
    }

    // Use the weather data
    const weatherData = datas;

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
            className={`${tempGradient} p-4 rounded-lg h-full flex flex-col border border-gray-200`}
        >
            {/* Header section */}
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-gray-800">
                    날씨 정보
                </h3>
                <span className="text-sm text-gray-700">
                    {weatherData?.area_nm || "위치 정보 없음"}
                </span>
            </div>

            {/* Current temperature and conditions */}
            <div className="flex items-center justify-between mt-1 mb-3">
                <div>
                    <p className="text-3xl font-bold text-gray-900">
                        {weatherData?.temp || "?"}°C
                    </p>
                    <p className="text-sm text-gray-700">
                        체감 {weatherData?.sensible_temp || "?"}°C
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-4xl mb-1">
                        {hasForecast
                            ? getWeatherIcon(
                                  forecastItems[0]?.pre_sky_stts || "흐림"
                              )
                            : "☁️"}
                    </div>
                    <p className="text-sm text-gray-700">
                        {hasForecast
                            ? forecastItems[0]?.pre_sky_stts || "정보 없음"
                            : "정보 없음"}
                    </p>
                </div>
            </div>

            {/* Min/Max temperature */}
            <div className="flex justify-between text-sm text-gray-700 mb-2">
                <span>최저 {weatherData?.min_temp || "?"}°C</span>
                <span>최고 {weatherData?.max_temp || "?"}°C</span>
            </div>

            {/* Air quality */}
            <div className="bg-white/80 rounded-md p-2 mb-2 text-xs border border-gray-200">
                <div className="flex justify-between mb-1">
                    <span className="text-gray-700">미세먼지</span>
                    <span className={`font-medium ${pm10Status.color}`}>
                        {pm10Status.text} ({pm10})
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-700">초미세먼지</span>
                    <span className={`font-medium ${pm25Status.color}`}>
                        {pm25Status.text} ({pm25})
                    </span>
                </div>
            </div>

            {/* Forecast section */}
            {hasForecast && (
                <div className="mt-auto pt-2 border-t border-gray-300">
                    <div className="flex justify-between">
                        {forecastItems.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col items-center"
                            >
                                <span className="text-xs text-gray-700">
                                    {formatForecastTime(item.fcst_dt)}
                                </span>
                                <span className="my-1">
                                    {getWeatherIcon(item.pre_sky_stts)}
                                </span>
                                <span className="text-xs text-gray-800 font-medium">
                                    {item.pre_temp}°
                                </span>
                                {item.pre_rain_chance > 0 && (
                                    <span className="text-xs mt-0.5 text-blue-600 font-medium">
                                        {item.pre_rain_chance}%
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Update time */}
            <div className="text-right text-xs text-gray-600 mt-2">
                {weatherData?.weather_time || "업데이트 시간 정보 없음"} 기준
            </div>
        </div>
    );
};

export default WeatherCard;
