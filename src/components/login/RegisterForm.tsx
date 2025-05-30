import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { signupUser } from "../../api/authApi";

const mbtiOptions = [
    "INTJ",
    "INTP",
    "ENTJ",
    "ENTP",
    "INFJ",
    "INFP",
    "ENFJ",
    "ENFP",
    "ISTJ",
    "ISFJ",
    "ESTJ",
    "ESFJ",
    "ISTP",
    "ISFP",
    "ESTP",
    "ESFP",
];

interface RegisterFormState {
    user_id: string;
    nickname: string;
    password: string;
    confirmPassword?: string;
    mbti: string;
    birth_year: string;
    gender: string;
}

interface RegisterFormProps {
    onRegisterSuccess: () => void;
}

export default function RegisterForm({ onRegisterSuccess }: RegisterFormProps) {
    const [form, setForm] = useState<RegisterFormState>({
        user_id: "",
        nickname: "",
        password: "",
        confirmPassword: "",
        mbti: "",
        birth_year: "",
        gender: "",
    });
    const [isRegistered, setIsRegistered] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (!form.user_id || !form.nickname || !form.password) {
            alert("아이디, 닉네임, 비밀번호는 필수 입력 사항입니다.");
            return;
        }

        const signupParam = { ...form };
        delete signupParam.confirmPassword;

        try {
            await signupUser(signupParam);
            setIsRegistered(true);
            setTimeout(() => {
                onRegisterSuccess();
            }, 1500);
        } catch (err: unknown) {
            if (
                typeof err === "object" &&
                err !== null &&
                "response" in err &&
                (err as any).response.data?.error
            ) {
                alert((err as any).response.data.error);
            } else {
                alert("회원가입 실패: " + err);
            }
        }
    };

    if (isRegistered) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center justify-center text-center text-blue-500"
            >
                <h2 className="text-3xl font-bold mb-4">
                    가입을 축하합니다! 🎉
                </h2>
                <p className="text-sm opacity-80">
                    로그인 화면으로 이동합니다...
                </p>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
                { name: "user_id", label: "아이디", type: "text" },
                { name: "nickname", label: "닉네임", type: "text" },
                { name: "password", label: "비밀번호", type: "password" },
                {
                    name: "confirmPassword",
                    label: "비밀번호 확인",
                    type: "password",
                },
            ].map((field) => (
                <div
                    key={field.name}
                    className="group w-[85%] mx-auto border-b border-gray-300 focus-within:border-blue-500 grid grid-cols-[7%_93%] items-center relative"
                >
                    <div className="flex justify-center items-center text-gray-400">
                        <i
                            className={`fas fa-${field.type === "password" ? "lock" : "user"}`}
                        ></i>
                    </div>
                    <div className="relative h-[45px]">
                        <label
                            className={`absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-[18px] transition-all duration-300
                            ${form[field.name as keyof RegisterFormState] ? "top-[-5px] text-[15px] text-blue-500" : "group-focus-within:top-[-5px] group-focus-within:text-[15px] group-focus-within:text-blue-500"}`}
                        >
                            {field.label}
                        </label>
                        <input
                            type={field.type}
                            name={field.name}
                            required
                            className="absolute left-0 top-0 w-full h-full bg-transparent text-gray-700 outline-none px-2 text-[1rem]"
                            value={
                                form[field.name as keyof RegisterFormState] ||
                                ""
                            }
                            onChange={handleChange}
                        />
                    </div>
                </div>
            ))}

            <select
                name="mbti"
                required
                value={form.mbti}
                onChange={handleChange}
                className="w-[85%] mx-auto px-4 py-2 bg-[#e0e5ec] border-b border-gray-300 text-gray-700 focus:border-blue-500 focus:outline-none"
            >
                <option value="" disabled>
                    MBTI 선택
                </option>
                {mbtiOptions.map((type) => (
                    <option key={type} value={type}>
                        {type}
                    </option>
                ))}
            </select>

            <input
                type="number"
                name="birth_year"
                placeholder="출생년도 (예: 2000)"
                required
                className="w-[85%] mx-auto px-4 py-2 bg-[#e0e5ec] border-b border-gray-300 text-gray-700 focus:border-blue-500 focus:outline-none"
                value={form.birth_year}
                onChange={handleChange}
            />

            <select
                name="gender"
                required
                value={form.gender}
                onChange={handleChange}
                className="w-[85%] mx-auto px-4 py-2 bg-[#e0e5ec] border-b border-gray-300 text-gray-700 focus:border-blue-500 focus:outline-none"
            >
                <option value="" disabled>
                    성별 선택
                </option>
                <option value="male">남성</option>
                <option value="female">여성</option>
            </select>

            <button
                type="submit"
                className="mt-4 w-[85%] mx-auto py-2 px-4 bg-blue-500 text-white font-semibold rounded-2xl shadow-[6px_6px_20px_rgba(163,177,198,0.6),-6px_-6px_20px_rgba(255,255,255,0.9)] hover:bg-blue-600 focus:outline-none"
            >
                회원가입
            </button>
        </form>
    );
}
