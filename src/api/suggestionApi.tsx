import jwtAxios from "../utils/jwtUtil";
import API_SERVER_HOST from "./apiConfig";

const prefix = `${API_SERVER_HOST}/user/suggest`;


export const getUserSuggestionList = async (member_id: string | undefined) => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    const res = await jwtAxios.get(`${prefix}/${member_id}`, header);
    // const res = await jwtAxios.get(`http://localhost:8083/suggest/${member_id}`, header);
    return res.data;
};

export const createUserSuggestion = async (member_id: string | undefined,
    input: {
        question_type: number;
        start_time: string;
        finish_time: string;
        start_place: string;
        optional_request: string;
    }
) => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    const res = await jwtAxios.post(`${prefix}/${member_id}`, input, header);
    // const res = await jwtAxios.post(`http://localhost:8083/suggest/${member_id}`, input, header);
    return res.data;
}
