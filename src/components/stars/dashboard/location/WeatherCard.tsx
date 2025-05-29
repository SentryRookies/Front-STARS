import { motion } from "framer-motion";
import React from "react";

// WeatherForecast and WeatherData types should match DashboardComponent
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

interface WeatherCardProps {
    style: { opacity: number; y: number; scale: number };
    cardRef: (el: HTMLDivElement | null) => void;
    weather: WeatherData | null;
}

export default function WeatherCard({
    style,
    cardRef,
    weather,
}: WeatherCardProps) {
    if (!weather) {
        return (
            <motion.div
                className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-6 bg-red-500 rounded-3xl shadow-lg p-4 my-2"
                whileHover={{ y: -6 }}
                animate={
                    style
                        ? {
                              opacity: style.opacity,
                              y: style.y,
                              scale: style.scale,
                          }
                        : {}
                }
                style={style}
                ref={cardRef}
            >
                <p className="text-md text-gray-200">Loading weather data...</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-6 bg-red-500 rounded-3xl shadow-lg p-4 my-2"
            whileHover={{ y: -6 }}
            animate={
                style
                    ? { opacity: style.opacity, y: style.y, scale: style.scale }
                    : {}
            }
            style={style}
            ref={cardRef}
        >
            <p className="text-md text-gray-200">{weather.area_nm} 현재 날씨</p>
            <p className="text-4xl text-white font-bold">{weather.temp}℃</p>
            <p className="text-sm text-gray-200 mt-1">
                PM10 : {weather.pm10}㎍/㎥ · 강수확률 :{" "}
                {weather.fcst24hours?.[0]?.pre_rain_chance ?? "-"}%
            </p>
            <div className="flex justify-between text-gray-200 mt-4 text-sm">
                {weather.fcst24hours.slice(0, 6).map((f, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <span>{f.fcst_dt.slice(8, 10)}시</span>
                        <span>
                            {f.pre_sky_stts === "맑음"
                                ? "☀️"
                                : f.pre_sky_stts === "구름많음"
                                  ? "⛅️"
                                  : "☁️"}
                        </span>
                        <span>{f.pre_temp}℃</span>
                    </div>
                ))}
            </div>
            <p className="text-xs text-gray-200 mt-2">{weather.pcp_msg}</p>
        </motion.div>
    );
}
