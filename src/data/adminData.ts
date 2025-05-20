// src/data/adminData.ts

export interface TouristSpot {
    area_nm: string;
    area_cd: string;
    area_congest_lvl: string;
}

export interface WeatherCardType {
    date: string;
    hour: string;
    status: string;
    icon: string;
    temperature: string;
    dust: {
        fineDust: string;
        ultraFineDust: string;
    };
}

export interface TouristInfo {
    spotName: string; // 이름
    spotCode: string; // 코드
    timestamp: string; // 측정시간
    participantCount: string; // 4단계 예측
}

export interface PopulationData {
    area_nm: string; // 지역명
    area_cd: string; // 지역 코드
    area_id: number; // 지역 아이디
    area_congest_lvl: string; // 지역 혼잡도 수준
    area_congest_msg: string; // 지역 혼잡도 메시지
    get_time: number; // 최신화 시간
    area_ppltn_min: number; // 지역 최소 인구
    area_ppltn_max: number; // 지역 최대 인구
    male_ppltn_rate: number; // 남성 인구 비율
    female_ppltn_rate: number; // 여성 인구 비율
    resnt_ppltn_rate: number; // 거주 인구 비율
    non_resnt_ppltn_rate: number; // 비거주 인구 비율
    replace_yn: string; // 대체 여부
    ppltn_time: string; // 인구 데이터 시간
    fcst_yn: string; // 예측 여부
    fcst_ppltn: ForecastPopulation[]; // 예측 인구 데이터 래퍼
    ppltn_rates: number[]; // 연령별 인구 분포
}

// 전체 데이터 구조 인터페이스
export interface PopulationResponse {
    data: PopulationData[]; // 인구 데이터
}

export interface ForecastPopulationWrapper {
    fcst_ppltn: ForecastPopulation[]; // 예측 인구 데이터 배열
}

export interface ForecastPopulation {
    fcst_time: string; // 예측 시간
    fcst_congest_lvl: string; // 예측 혼잡도 수준
    fcst_ppltn_min: number; // 예측 최소 인구
    fcst_ppltn_max: number; // 예측 최대 인구
}

// 넌 뭐냐?
export interface Data {
    name: string;
    value: number;
    fill: string;
}

// 즐겨찾기 데이터
export type Favorite = {
    favorite_id: number;
    type: string;
    name: string;
    address: string;
    place_id: string;
    user_id: string;
};

// 관리자 페이지 즐겨찾기 모아보기용
export interface UserFavoriteList {
    user_id: string;
    content: Favorite[];
}

// 날씨 예보 데이터 타입 정의
export interface WeatherForecast {
    fcst_dt: string;
    pre_temp: number;
    pre_precipitation: number;
    pre_precpt_type: string;
    pre_rain_chance: number;
    pre_sky_stts: string;
}

// 날씨 데이터 타입 정의
export interface WeatherData {
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
    area_id: number;
    get_time: number;
    weather_time: string;
    fcst24hours: WeatherForecast[];
}

export interface CombinedAreaData {
    area_id: number;
    area_nm: string;
    // 인구 데이터
    population: PopulationData | null;
    // 날씨 데이터
    weather: WeatherData | null;
}

export interface AccidentData {
    acdnt_dtype: string;
    acdnt_info: string;
    acdnt_occr_dt: string;
    acdnt_time: string;
    acdnt_type: string;
    acdnt_x: number;
    acdnt_y: number;
    area_id: number;
    area_nm: string;
    exp_clr_dt: string;
    get_time: number;
    search: string;
}

export interface TrafficData {
    area_nm: string;
    area_id: number;
    get_time: number;
    road_msg: string;
    road_traffic_spd: number;
    road_traffic_idx: string;
    road_traffic_stts: RoadTrafficNode[];
}

export interface RoadTrafficNode {
    dist: number;
    end_nd_cd: string;
    end_nd_nm: string;
    end_nd_xy: string;
    idx: string;
    link_id: string;
    road_nm: string;
    spd: number;
    start_nd_cd: string;
    start_nd_nm: string;
    start_nd_xy: string;
    xylist: string;
}

// 주차장 정보
export interface ParkData {
    area_id: number;
    area_nm: string;
    get_time: number;
    pk_time: string;
    prk_stts: ParkNode[];
}

export interface ParkNode {
    add_rates: number; // 추가 주차 단위 요금
    add_time_rates: number; // 추가 주차 단위 시간
    address: string; // 주소
    cpcty: number; // 주차장 수용 가능 면수
    cur_prk_cnt: number; // 현재 주차중인 대수
    cur_prk_yn: string; // 실시간 정보 제공 여부
    cur_prk_time: string; // 실시간 정보 업데이트 시각
    lat: number; // 위도
    lon: number; // 경도
    pay_yn: string; // 유무료 여부
    prk_cd: string; // 주차장 코드
    prk_nm: string; // 주차장 이름
    prk_type: string; // 주차장 유형(NS: 노상, BS: 부설, BP: 공영, NW: 노외, NP: 민영)
    rates: number; // 기본 주차 요금
    road_addr: string;
    time_rates: number; // 기본 주차 단위 시간
}

export interface MapData {
    area_id: number;
    area_nm: string;
    parkData: ParkData | null;
    trafficData: TrafficData | null;
}
