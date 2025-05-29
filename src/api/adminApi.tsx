import jwtAxios from "../utils/jwtUtil";
import API_SERVER_HOST from "./apiConfig";

const prefix = `${API_SERVER_HOST}/user/admin`;

export const getUserList = async () => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    const res = await jwtAxios.get(`${prefix}/user/list`, header);
    return res.data;
};

export const getFavoriteList = async () => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    const res = await jwtAxios.get(`${prefix}/favorite/list`, header);
    return res.data;
};
