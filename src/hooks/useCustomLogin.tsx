import { useDispatch, useSelector } from "react-redux";
import { Navigate, createSearchParams, useNavigate } from "react-router-dom";
import { loginPostAsync, logoutPostAsync } from "../slices/loginSlice";
import type { AppDispatch } from "../store";
import type { RootState } from "../store";

// 로그인 파라미터 타입 예시
interface LoginParam {
    user_id: string;
    password: string;
}

// 에러 타입 예시
interface ErrorResponse {
    response: {
        data: {
            error: string;
        };
    };
}

const useCustomLogin = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const loginState = useSelector((state: RootState) => state.loginSlice);

    const isLogin = !!loginState.user_id;

    const doLogin = async (loginParam: LoginParam) => {
        const action = await dispatch(loginPostAsync(loginParam));
        return action.payload;
    };

    const doLogout = () => {
        dispatch(logoutPostAsync());
        navigate({ pathname: "/" }, { replace: true });
    };

    const moveToPath = (path: string) => {
        navigate({ pathname: path }, { replace: true });
    };

    const moveToLogin = () => {
        navigate({ pathname: "/login" }, { replace: false });
    };

    const moveToLoginReturn = () => {
        return <Navigate replace to="/member/login" />;
    };

    const moveToModify = () => {
        navigate({ pathname: "/member/modify" }, { replace: true });
    };

    const exceptionHandle = (ex: ErrorResponse) => {
        const errorMsg = ex.response.data.error;
        const errorStr = createSearchParams({ error: errorMsg }).toString();
        if (errorMsg === "REQUIRE_LOGIN") {
            alert("로그인 해야만 합니다.");
            navigate({ pathname: "/member/login", search: errorStr });
            return;
        }
        if (errorMsg === "ERROR_ACCESS_DENIED") {
            alert("해당 메뉴를 사용할 수 있는 권한이 없습니다.");
            navigate({ pathname: "/member/login", search: errorStr });
            return;
        }
    };

    return {
        loginState,
        isLogin,
        doLogin,
        doLogout,
        moveToPath,
        moveToLogin,
        moveToLoginReturn,
        moveToModify,
        exceptionHandle,
    };
};

export default useCustomLogin;
