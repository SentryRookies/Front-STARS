import axios, {
    InternalAxiosRequestConfig,
    AxiosResponse,
    AxiosError,
    AxiosHeaders,
} from "axios";
import { getCookie, setCookie } from "./cookieUtil";
import { refreshToken as refreshTokenApi } from "../api/authApi";

// axios 인스턴스 생성
const jwtAxios = axios.create();

interface UserCookie {
    accessToken: string;
    refreshToken: string;
}

interface ErrorResponse {
    error?: string;
    message?: string;
    [key: string]: unknown;
}

const beforeReq = async (
    config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> => {
    const userInfo = getCookie<UserCookie>("user");
    console.log("요청 직전 accessToken:", userInfo?.accessToken);
    if (!userInfo) {
        console.error("토큰 정보를 찾을 수 없습니다. 로그인 필요");
        return Promise.reject({
            response: {
                data: {
                    error: "REQUIRE_LOGIN",
                },
            },
        });
    }

    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${userInfo.accessToken}`;

    return config;
};

const requestFail = (err: AxiosError): Promise<never> => {
    console.error("요청 중 오류가 발생했습니다:", err);
    return Promise.reject(err);
};

const beforeRes = async (
    res: AxiosResponse<ErrorResponse>
): Promise<AxiosResponse> => {
    return res;
};

const responseFail = async (err: AxiosError<ErrorResponse>): Promise<never> => {
    const res = err.response;
    const originalRequest = err.config;

    // 모든 401 응답에 대해 처리 (메시지 조건 제거)
    if (res?.status === 401) {
        // 재시도 했으면 무한루프 방지
        if (
            (
                originalRequest as InternalAxiosRequestConfig & {
                    _retry?: boolean;
                }
            )?._retry
        ) {
            alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
            return Promise.reject("REQUIRE_LOGIN");
        }

        const user = getCookie<UserCookie>("user");
        if (!user) {
            alert("로그인 정보가 만료되었습니다.");
            return Promise.reject("REQUIRE_LOGIN");
        }

        try {
            console.log("responseFail에서 토큰 갱신 시도");
            const result = await refreshTokenApi();

            if (!result.accessToken) {
                alert("로그인 정보가 만료되었습니다.");
                return Promise.reject("REQUIRE_LOGIN");
            }

            user.accessToken = result.accessToken;
            if (result.refreshToken) {
                user.refreshToken = result.refreshToken;
            }
            setCookie("user", JSON.stringify(user));

            if (!originalRequest) {
                alert("요청 정보를 찾을 수 없습니다.");
                return Promise.reject("NO_ORIGINAL_REQUEST");
            }

            // 재시도 플래그 설정
            (
                originalRequest as InternalAxiosRequestConfig & {
                    _retry?: boolean;
                }
            )._retry = true;

            const headers = new AxiosHeaders(originalRequest.headers);
            headers.set("Authorization", `Bearer ${result.accessToken}`);
            originalRequest.headers = headers;

            return axios(originalRequest);
        } catch (refreshError) {
            alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
            return Promise.reject(refreshError);
        }
    }

    console.error("응답 처리 중 오류가 발생했습니다:", err);
    return Promise.reject(err);
};

jwtAxios.interceptors.request.use(beforeReq, requestFail);
jwtAxios.interceptors.response.use(beforeRes, responseFail);

export default jwtAxios;
