import axios from "axios";
import API_SERVER_HOST from "./apiConfig";

const prefix = `${API_SERVER_HOST}`;

// SSE congestion 통합 구독
export const subscribeCongestions = (
    onCongestionUpdate: (data: Record<string, unknown>) => void,
    onCongestionAlert: (data: Record<string, unknown>) => void
): EventSource => {
    const eventSource = new EventSource(
        `${prefix}/control/congestion/main/congestion`
    );

    eventSource.addEventListener("congestion-update", (event) => {
        const data = JSON.parse((event as MessageEvent).data);
        onCongestionUpdate(data);
    });

    eventSource.addEventListener("congestion-alert", (event) => {
        const data = JSON.parse((event as MessageEvent).data);
        onCongestionAlert(data);
    });

    return eventSource;
};

// 기타 부가 SSE 통합 등록
export const subscribeExternal = (
    onWeatherUpdate: (data: Record<string, unknown>) => void,
    onTrafficUpdate: (data: Record<string, unknown>) => void,
    onParkUpdate: (data: Record<string, unknown>) => void,
    onAccidentUpdate: (data: Record<string, unknown>) => void
) => {
    const eventSource = new EventSource(
        `${prefix}/control/external/main/stream`
    );
    eventSource.addEventListener("weather-update", (event) => {
        const weatherData = JSON.parse((event as MessageEvent).data);
        onWeatherUpdate(weatherData);
    });
    eventSource.addEventListener("traffic-update", (event) => {
        const trafficData = JSON.parse((event as MessageEvent).data);
        onTrafficUpdate(trafficData);
    });
    eventSource.addEventListener("park-update", (event) => {
        const parkData = JSON.parse((event as MessageEvent).data);
        onParkUpdate(parkData);
    });
    eventSource.addEventListener("accident-alert", (event) => {
        const parkData = JSON.parse((event as MessageEvent).data);
        onAccidentUpdate(parkData);
    });
    return eventSource;
};

// 실시간 모든 관광지 혼잡도 수신
export const subscribeCongestionUpdate = (
    onUpdate: (data: Record<string, unknown>) => void
): EventSource => {
    const eventSource = new EventSource(
        `${prefix}/control/congestion/main/congestion`
    );
    eventSource.addEventListener("congestion-update", (event) => {
        const congestionData = JSON.parse((event as MessageEvent).data);
        onUpdate(congestionData);
    });
    console.log("connect Congestion Update");
    return eventSource;
};

// 실시간 혼잡도 알림 수신 3,4단계
export const subscribeCongestionAlert = (
    onAlert: (data: Record<string, unknown>) => void
): EventSource => {
    const eventSource = new EventSource(
        `${prefix}/control/congestion/main/congestion`
    );
    eventSource.addEventListener("congestion-alert", (event) => {
        const alertData = JSON.parse((event as MessageEvent).data);
        onAlert(alertData);
    });
    console.log("connect Congestion Alert");
    return eventSource;
};

// 실시간 날씨 정보
export const subscribeWeatherUpdate = (
    onUpdate: (data: Record<string, unknown>) => void
): EventSource => {
    const eventSource = new EventSource(
        `${prefix}/control/external/main/stream`
    );
    eventSource.addEventListener("weather-update", (event) => {
        const weatherData = JSON.parse((event as MessageEvent).data);
        onUpdate(weatherData);
    });
    console.log("connect Weather Update");
    return eventSource;
};

// 실시간 교통 정보 수신
export const subscribeTrafficUpdate = (
    onUpdate: (data: Record<string, unknown>) => void
): EventSource => {
    const eventSource = new EventSource(
        `${prefix}/control/external/main/stream`
    );
    eventSource.addEventListener("traffic-update", (event) => {
        const trafficData = JSON.parse((event as MessageEvent).data);
        onUpdate(trafficData);
    });
    console.log("connect Trraffic Update");
    return eventSource;
};

// 실시간 주차 정보 수신
export const subscribeParkUpdate = (
    onUpdate: (data: Record<string, unknown>) => void
): EventSource => {
    const eventSource = new EventSource(
        `${prefix}/control/external/main/stream`
    );
    eventSource.addEventListener("park-update", (event) => {
        const parkData = JSON.parse((event as MessageEvent).data);
        onUpdate(parkData);
    });
    console.log("connect Park Update");
    return eventSource;
};

// 실시간 사고상황 정보 수신
export const subscribeAccidentUpdate = (
    onUpdate: (data: Record<string, unknown>) => void
): EventSource => {
    const eventSource = new EventSource(
        `${prefix}/control/external/main/stream`
    );
    eventSource.addEventListener("accident-alert", (event) => {
        const parkData = JSON.parse((event as MessageEvent).data);
        onUpdate(parkData);
    });
    console.log("connect Accident Update");
    return eventSource;
};

// 지역 목록 조회
export const getAreaList = async () => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    const res = await axios.get(`${prefix}/place/main/area/list`, header);
    return res.data;
};

// 관광지 목록 조회
export const getAttractionList = async () => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    const res = await axios.get(`${prefix}/place/main/attraction/list`, header);
    return res.data;
};

// 음식점 목록 조회
export const getRestaurantList = async () => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    const res = await axios.get(`${prefix}/place/main/restaurant/list`, header);
    return res.data;
};

// 카페 목록 조회
export const getCafeList = async () => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    const res = await axios.get(`${prefix}/place/main/cafe/list`, header);
    return res.data;
};

// 숙소 목록 조회
export const getAccommodationList = async () => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    const res = await axios.get(
        `${prefix}/place/main/accommodation/list`,
        header
    );
    return res.data;
};

// 관광지 상세 조회
export const getAttractionDetail = async (attractionId: string) => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    const res = await axios.get(
        `${prefix}/place/main/info/attraction/${attractionId}`,
        header
    );
    return res.data;
};

// 식당 상세 조회
export const getRestaurantDetail = async (restaurantId: string) => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    const res = await axios.get(
        `${prefix}/place/main/info/restaurant/${restaurantId}`,
        header
    );
    return res.data;
};

// 카페 상세 조회
export const getCafeDetail = async (cafeId: string) => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    const res = await axios.get(
        `${prefix}/place/main/info/cafe/${cafeId}`,
        header
    );
    return res.data;
};

// 숙소 상세 조회
export const getAccommodationDetail = async (accommodationId: string) => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    const res = await axios.get(
        `${prefix}/place/main/info/accommodation/${accommodationId}`,
        header
    );
    return res.data;
};

// 행사 목록 조회
export const getEventList = async () => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    console.log("fetching event list...");
    try {
        const res = await axios.get(`${prefix}/place/main/events`, header);
        return res.data;
    } catch (err) {
        console.error("Event list fetch error:", err);
        throw err;
    }
};

// 지역별 장소 목록 조회
export const getPlaceListByArea = async (areaId: number) => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    const res = await axios.get(
        `${prefix}/place/main/place/list/${areaId}`,
        header
    );
    return res.data;
};
