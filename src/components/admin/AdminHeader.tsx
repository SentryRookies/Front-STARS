import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useCustomLogin from "../../hooks/useCustomLogin";

interface Props {
    path: string;
}

export default function AdminHeader({ path }: Props) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { doLogout, moveToPath } = useCustomLogin();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const menuItems = [
        { label: "대시보드", path: "/manage" },
        { label: "축제 현황", path: "/manage/tour" },
        { label: "사용자 즐겨찾기", path: "/manage/user" },
        { label: "도로 혼잡도", path: "/manage/traffic" },
        { label: "로그아웃(메인으로)", path: "/login" },
    ];

    return (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-4 flex items-center justify-between relative">
            <div className="flex items-center">
                <button
                    className="bg-white/20 backdrop-blur-sm shadow-md px-2 sm:px-4 py-2 text-white font-semibold hover:bg-white/30 hover:text-white transition rounded-md border border-white/30"
                    onClick={() => {
                        navigate(path);
                    }}
                >
                    <span className="inline-block text-xl"> ← </span>
                    <span className="hidden sm:inline-block ml-1">
                        돌아가기
                    </span>
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-white ml-4 sm:ml-8">
                    STARS 관리자 통합 화면
                </h1>
            </div>

            {/* 메뉴 버튼 */}
            <div className="relative">
                <button
                    onClick={toggleMenu}
                    className="bg-white/20 backdrop-blur-sm shadow-md px-3 py-2 text-white font-medium hover:bg-white/30 transition rounded-md flex items-center border border-white/30"
                >
                    <span>menu</span>
                    <svg
                        className={`w-4 h-4 ml-2 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>

                {/* 드롭다운 메뉴 */}
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                        <div className="py-1 border rounded-md">
                            {menuItems.map((item, index) => (
                                <button
                                    key={index}
                                    className="w-full text-left px-4 py-2 text-sm bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        if (item.path === "/login") {
                                            doLogout();
                                            moveToPath("/");
                                        } else navigate(item.path);
                                    }}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 메뉴 바깥 영역 클릭 시 메뉴 닫기 */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}
        </div>
    );
}
