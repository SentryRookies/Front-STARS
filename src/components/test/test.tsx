import React, { ReactNode } from "react";
import TrafficMap from "../admin/TrafficMapComponent";
import { dummyTrafficData } from "../../data/dummy/traffic";

interface CardProps {
    title: string;
    children: ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = "" }) => {
    return (
        <div
            className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
        >
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">{title}</h3>
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: number | string;
    icon: ReactNode;
    color?: "blue" | "green" | "red" | "orange" | "purple";
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    color = "blue",
}) => {
    const colorClasses = {
        blue: "bg-blue-100 text-blue-800",
        green: "bg-green-100 text-green-800",
        red: "bg-red-100 text-red-800",
        orange: "bg-orange-100 text-orange-800",
        purple: "bg-purple-100 text-purple-800",
    };

    return (
        <Card title={title} className="flex flex-col h-full">
            <div className="flex items-center">
                <div className={`p-3 rounded-full ${colorClasses[color]} mr-4`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="text-xl font-semibold">{value}</p>
                </div>
            </div>
        </Card>
    );
};

const Test: React.FC = () => {
    // 트래픽 데이터가 있다고 가정하고 몇 가지 통계 추출
    const trafficData = dummyTrafficData[0];
    const roadCount = trafficData?.road_traffic_stts?.length || 0;
    const jammedRoads =
        trafficData?.road_traffic_stts?.filter((r) => r.idx === "정체")
            ?.length || 0;
    const fluentRoads =
        trafficData?.road_traffic_stts?.filter((r) => r.idx === "원활")
            ?.length || 0;
    const slowRoads =
        trafficData?.road_traffic_stts?.filter((r) => r.idx === "서행")
            ?.length || 0;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-black">
                교통 대시보드
            </h1>

            {/* 통계 카드 행 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="총 도로 구간"
                    value={roadCount}
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                            />
                        </svg>
                    }
                    color="blue"
                />
                <StatCard
                    title="원활 구간"
                    value={fluentRoads}
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                    }
                    color="green"
                />
                <StatCard
                    title="서행 구간"
                    value={slowRoads}
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    }
                    color="orange"
                />
                <StatCard
                    title="정체 구간"
                    value={jammedRoads}
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
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
                    }
                    color="red"
                />
            </div>

            {/* 메인 카드 행 - 지도와 다른 카드들 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 사용법 1 : 카드 안에 잘 모셛두기 */}
                <Card title="실시간 교통 지도" className="lg:col-span-2">
                    <div className="h-[500px]">
                        <TrafficMap
                            trafficData={dummyTrafficData[0]}
                            initialZoom={14}
                            height="100%"
                            width="100%"
                        />
                    </div>
                </Card>

                {/* 사용법 2 : 그냥 때려박기 */}
                <TrafficMap
                    trafficData={dummyTrafficData[0]}
                    initialZoom={14}
                    height="100%"
                    width="100%"
                />

                {/* 오른쪽 1/3 정보 카드들 */}
                <div className="lg:col-span-1 space-y-6">
                    <Card title="혼잡 구간 정보">
                        <div className="space-y-3">
                            {trafficData?.road_traffic_stts
                                ?.filter((road) => road.idx === "정체")
                                ?.slice(0, 5)
                                ?.map((road, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 bg-red-50 rounded-md"
                                    >
                                        <p className="font-medium">
                                            {road.road_nm}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            속도: {road.spd}km/h
                                        </p>
                                    </div>
                                )) || <p>정체 구간 정보가 없습니다.</p>}
                        </div>
                    </Card>

                    <Card title="교통 현황 요약">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>정체율:</span>
                                <span className="font-semibold">
                                    {roadCount
                                        ? Math.round(
                                              (jammedRoads / roadCount) * 100
                                          )
                                        : 0}
                                    %
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-red-600 h-2.5 rounded-full"
                                    style={{
                                        width: `${roadCount ? Math.round((jammedRoads / roadCount) * 100) : 0}%`,
                                    }}
                                ></div>
                            </div>

                            <div className="flex justify-between mt-4">
                                <span>원활율:</span>
                                <span className="font-semibold">
                                    {roadCount
                                        ? Math.round(
                                              (fluentRoads / roadCount) * 100
                                          )
                                        : 0}
                                    %
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-green-600 h-2.5 rounded-full"
                                    style={{
                                        width: `${roadCount ? Math.round((fluentRoads / roadCount) * 100) : 0}%`,
                                    }}
                                ></div>
                            </div>

                            <div className="flex justify-between mt-4">
                                <span>서행율:</span>
                                <span className="font-semibold">
                                    {roadCount
                                        ? Math.round(
                                              (slowRoads / roadCount) * 100
                                          )
                                        : 0}
                                    %
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-orange-500 h-2.5 rounded-full"
                                    style={{
                                        width: `${roadCount ? Math.round((slowRoads / roadCount) * 100) : 0}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* 추가 정보 카드 행 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card title="최근 업데이트">
                    <p className="text-sm text-gray-600">
                        마지막 업데이트: {new Date().toLocaleString("ko-KR")}
                    </p>
                    <p className="mt-2">
                        데이터는 5분마다 자동으로 갱신됩니다.
                    </p>
                </Card>

                <Card title="도로별 평균 속도">
                    <div className="space-y-2">
                        {trafficData?.road_traffic_stts
                            ?.slice(0, 3)
                            ?.map((road, idx) => (
                                <div
                                    key={idx}
                                    className="flex justify-between items-center"
                                >
                                    <span className="truncate pr-2">
                                        {road.road_nm}
                                    </span>
                                    <span className="font-semibold">
                                        {road.spd} km/h
                                    </span>
                                </div>
                            )) || <p>속도 정보가 없습니다.</p>}
                    </div>
                </Card>

                <Card title="데이터 소스">
                    <p className="text-sm">
                        교통 데이터는 서울시 실시간 교통 정보 API를 통해
                        제공됩니다.
                    </p>
                    <a
                        href="#"
                        className="inline-block mt-2 text-blue-600 hover:text-blue-800"
                    >
                        자세한 정보 보기
                    </a>
                </Card>
            </div>
        </div>
    );
};

export default Test;
