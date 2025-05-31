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
    const { doLogin, isLogin } = useCustomLogin();

    useEffect(() => {
        if (isLogin) navigate("/", { replace: true });
    }, []);

    type LoginResult = { error?: string };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const result = (await doLogin({
                user_id,
                password,
            })) as LoginResult;
            if (!result.error) {
                setIsLoggedIn(true);
                setTimeout(() => navigate("/", { replace: true }), 1500);
            } else {
                onError(result.error || "로그인 실패");
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
                className="flex flex-col items-center justify-center text-center text-blue-500"
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
            <div className="input-div one group relative grid grid-cols-[7%_93%] mb-6 border-b-2 border-gray-300 focus-within:border-blue-500 w-[85%] mx-auto">
                <div className="i flex justify-center items-center text-gray-300 group-focus-within:text-blue-500">
                    <i className="fas fa-user transition duration-300"></i>
                </div>
                <div className="relative h-[45px]">
                    <label
                        className={`absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-[18px] transition-all duration-300
    ${user_id ? "top-[-5px] text-[15px] text-blue-500" : "group-focus-within:top-[-5px] group-focus-within:text-[15px] group-focus-within:text-blue-500"}`}
                    >
                        ID
                    </label>
                    <input
                        type="text"
                        name="user_id"
                        className="absolute left-0 top-0 w-full h-full border-none outline-none bg-transparent px-3 py-2 text-[1.2rem] text-gray-700 font-poppins"
                        value={user_id}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="input-div pass group relative grid grid-cols-[7%_93%] mb-4 border-b-2 border-gray-300 focus-within:border-blue-500 w-[85%] mx-auto">
                <div className="i flex justify-center items-center text-gray-300 group-focus-within:text-blue-500">
                    <i className="fas fa-lock transition duration-300"></i>
                </div>
                <div className="relative h-[45px]">
                    <label
                        className={`absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-[18px] transition-all duration-300
    ${password ? "top-[-5px] text-[15px] text-blue-500" : "group-focus-within:top-[-5px] group-focus-within:text-[15px] group-focus-within:text-blue-500"}`}
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        className="absolute left-0 top-0 w-full h-full border-none outline-none bg-transparent px-3 py-2 text-[1.2rem] text-gray-700 font-poppins"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
            </div>
            <button
                type="submit"
                className="mt-4 w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-2xl shadow-[6px_6px_20px_rgba(163,177,198,0.6),-6px_-6px_20px_rgba(255,255,255,0.9)] hover:bg-blue-600 focus:outline-none"
            >
                로그인
            </button>
        </motion.form>
    );
}
