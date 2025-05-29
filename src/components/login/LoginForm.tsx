import { useState, useEffect, FormEvent } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useCustomLogin from "../../hooks/useCustomLogin";

interface LoginFormProps {
    onError: (msg: string) => void;
}

export default function LoginForm({ onError }: LoginFormProps) {
    const [user_id, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [shake, setShake] = useState(false);

    const navigate = useNavigate();
    const { doLogin, isLogin } = useCustomLogin(); // isLogin 추가

    // 이미 로그인 상태면 바로 이동
    useEffect(() => {
        if (isLogin) {
            navigate("/", { replace: true });
        }
    }, []); // 다시 이 페이지에 방문할때만을 위해 isLogin을 의존성에서 제거

    type LoginResult = {
        error?: string;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const result = (await doLogin({
                user_id,
                password,
            })) as LoginResult;

            if (result && !result.error) {
                setIsLoggedIn(true);
                setTimeout(() => {
                    navigate("/", { replace: true });
                }, 1500);
            } else {
                onError(result?.error || "로그인 실패");
                setShake(true);
                setTimeout(() => setShake(false), 500);
            }
        } catch {
            onError("아이디 또는 비밀번호가 올바르지 않습니다.");
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    if (isLoggedIn) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center justify-center text-center text-white"
            >
                <h2 className="text-3xl font-bold mb-4">환영합니다!</h2>
                <p className="text-sm opacity-80">잠시 후 이동합니다...</p>
            </motion.div>
        );
    }

    return (
        <motion.form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
        >
            <input
                type="text"
                name="user_id"
                placeholder="아이디"
                required
                className="w-full px-4 py-2 bg-black/30 text-white rounded-md focus:outline-none"
                value={user_id}
                onChange={(e) => setUserId(e.target.value)}
            />
            <input
                type="password"
                name="password"
                placeholder="비밀번호"
                required
                className="w-full px-4 py-2 bg-black/30 text-white rounded-md focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button
                type="submit"
                className="mt-4 w-full py-2 px-4 bg-indigo-600/50 hover:bg-indigo-700/50 text-white font-semibold shadow-lg rounded-md focus:outline-none focus:ring-0"
            >
                로그인
            </button>
        </motion.form>
    );
}
