import axios from "axios";
import jwtAxios from "../utils/jwtUtil";
import API_SERVER_HOST from "./apiConfig";
import { getCookie } from "../utils/cookieUtil";

const prefix = `${API_SERVER_HOST}/user/auth`;

type SignupUser = {
    user_id: string;
    password: string;
    nickname: string;
    birth_year: string;
    mbti: string;
    gender: string;
};
export const loginPost = async (loginParam: {
    user_id: string;
    password: string;
}) => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    const res = await axios.post(
        `${prefix}/login`,
        JSON.stringify(loginParam),
        header
    );

    return res.data;
};
export const logoutPost = async () => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    const res = await jwtAxios.post(`${prefix}/logout`, null, header);
    console.log("logout res", res);
    if (res.data && res.data.message) {
        console.log("logout message:", res.data.message);
    }
    return res.data;
};

export const signupUser = async (user: SignupUser) => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    const res = await axios.post(
        `${prefix}/signup`,
        JSON.stringify(user),
        header
    );
    return res.data;
};

// 회원탈퇴
export const signoutUser = async (member_id: string | undefined) => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    const res = await jwtAxios.delete(`${prefix}/signout/${member_id}`, header);

    return res.data;
};

export const refreshToken = async () => {
    console.log("refreshToken 요청 시작");

    const user = getCookie<{ refreshToken: string }>("user");
    if (!user || !user.refreshToken) {
        throw new Error("리프레시 토큰이 없습니다.");
    }
    console.log("리프레시 토큰:", user.refreshToken);
    const body = {
        refreshToken: user.refreshToken,
    };

    const headers = {
        "Content-Type": "application/json",
    };

    const res = await axios.post(`${prefix}/refresh`, body, { headers });

    console.log("refreshToken 응답:", res);
    return res.data;
};
