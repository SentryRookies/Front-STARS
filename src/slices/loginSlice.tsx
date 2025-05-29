import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { loginPost, logoutPost } from "../api/authApi";
import { getCookie, setCookie, removeCookie } from "../utils/cookieUtil";

// 쿠키에 저장되는 멤버 타입 정의
interface UserCookie {
    member_id?: string;
    user_id: string;
    nickname?: string;
    birth_year?: string;
    mbti?: string;
    gender?: string;
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    error?: string;
}

const initState: UserCookie = {
    user_id: "",
};

const loadUserCookie = (): UserCookie => {
    const userInfo = getCookie<UserCookie>("user");

    if (userInfo && userInfo.user_id) {
        userInfo.user_id = decodeURIComponent(userInfo.user_id);
    }

    return userInfo || { ...initState };
};

export const loginPostAsync = createAsyncThunk(
    "loginPostAsync",
    (param: { user_id: string; password: string }) => {
        return loginPost(param);
    }
);

export const logoutPostAsync = createAsyncThunk("logoutPostAsync", async () => {
    removeCookie("user"); // 쿠키 삭제
    return { ...initState }; // 상태 초기화
    await logoutPost(); // 서버에 로그아웃 요청
});

const loginSlice = createSlice({
    name: "LoginSlice",
    initialState: loadUserCookie(),
    reducers: {
        login: (_state, action: PayloadAction<UserCookie>) => {
            const payload = action.payload;
            setCookie("user", JSON.stringify(payload));
            return payload;
        },
        logout: () => {
            removeCookie("user");
            return { ...initState };
        },
        updateLoginInfo: (
            state,
            action: PayloadAction<Partial<UserCookie>>
        ) => {
            const payload = action.payload;
            setCookie("user", JSON.stringify({ ...state, ...payload }));
            return { ...state, ...payload };
        },
        clearLoginInfo() {
            return { ...initState };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginPostAsync.fulfilled, (_state, action) => {
                const payload = action.payload as UserCookie;
                if (!payload.error) {
                    setCookie("user", JSON.stringify(payload));
                }

                return payload;
            })
            // 로그아웃 thunk 처리
            .addCase(logoutPostAsync.fulfilled, () => {
                return { ...initState };
            });
    },
});

export const isAdmin = (): boolean => {
    const cookie = loadUserCookie();
    return cookie.role === "ROLE_ADMIN";
};

export const { login, logout, updateLoginInfo, clearLoginInfo } =
    loginSlice.actions;
export default loginSlice.reducer;
