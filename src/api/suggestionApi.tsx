import jwtAxios from "../utils/jwtUtil";
import API_SERVER_HOST from "./apiConfig";

const prefix = `${API_SERVER_HOST}/user/suggest`;

// 사용자의 장소 추천 기록 조회
export const getUserSuggestionList = async (member_id: string | undefined) => {
    const header = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    const res = await jwtAxios.get(`${prefix}/${member_id}`, header);
    return res.data;
};

// 장소 추천 생성
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
    return res.data;
}
