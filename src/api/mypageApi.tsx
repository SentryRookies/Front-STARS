import jwtAxios from "../utils/jwtUtil";
import API_SERVER_HOST from "./apiConfig";
import { Favorite } from "../data/adminData";

const prefix = `${API_SERVER_HOST}/user/mypage`;

export type UserProfile = {
    user_id: string;
    nickname: string;
    birth_year: number;
    mbti: string;
    gender: string;
    current_password?: string; // Optional for when not changing password
    new_password?: string; // Optional for when not changing password
};

export const getUserProfile = async () => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    const res = await jwtAxios.get(`${prefix}/profile`, header);
    return res.data;
};

export const editUserProfile = async (user: UserProfile) => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    // Clone user object to avoid modifying the original
    const userData = { ...user };

    // If we don't have both current_password and new_password,
    // delete them to indicate we're not changing the password
    if (!userData.current_password || !userData.new_password) {
        delete userData.current_password;
        delete userData.new_password;
    }

    const res = await jwtAxios.post(`${prefix}/profile/edit`, userData, header);
    return res.data;
};

export const getUserFavoriteList = async () => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    const res = await jwtAxios.get(`${prefix}/favorite/list`, header);
    return res.data;
};

export const addFavorite = async (favorite: Favorite) => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    const res = await jwtAxios.post(`${prefix}/favorite/add`, favorite, header);
    return res.data;
};

export const addFavorite2 = async (type: string, id: number) => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    const data = {
        type: type,
        place_id: id,
    };

    const res = await jwtAxios.post(`${prefix}/favorite/add`, data, header);
    return res.data;
};

export const deleteFavorite = async (favorite: Favorite) => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    const res = await jwtAxios.delete(
        `${prefix}/favorite/delete/${favorite.type}/${favorite.place_id}`,
        header
    );
    return res.data;
};

export const deleteFavorite2 = async (type: string, id: number) => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    const res = await jwtAxios.delete(
        `${prefix}/favorite/delete/${type}/${id}`,
        header
    );
    return res.data;
};
