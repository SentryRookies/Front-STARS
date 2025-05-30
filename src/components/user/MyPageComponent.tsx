import React, { useState, useEffect } from "react";
import UserInfo from "./Info/UserInfo";
import UserFavorite from "./Favorite/UserFavorite";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItem {
    id: number;
    title: string;
    icon: string;
}

export default function MyPageComponent({
    onMapView,
}: {
    onMapView: (name: string) => void;
}) {
    const [selectedItem, setSelectedItem] = useState<MenuItem>({
        id: 1,
        title: "회원정보",
        icon: "👤",
    });

    // Menu data with icons
    const listItems: MenuItem[] = [
        {
            id: 1,
            title: "회원정보",
            icon: "👤",
        },
        {
            id: 2,
            title: "즐겨찾기",
            icon: "⭐",
        },
    ];

    // Mobile state detection
    const [isMobile, setIsMobile] = useState(false);
    // Mobile menu drawer state
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Detect mobile screen size
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Initial check
        checkIfMobile();

        // Add resize event listener
        window.addEventListener("resize", checkIfMobile);

        // Clean up event listener
        return () => {
            window.removeEventListener("resize", checkIfMobile);
        };
    }, []);

    // Handle menu item selection
    const handleSelectItem = (item: MenuItem) => {
        setSelectedItem(item);
        // Close mobile menu drawer when item is selected
        if (isMobile) {
            setMobileMenuOpen(false);
        }
    };

    // Render the selected component based on menu item
    const renderSelectedComponent = () => {
        switch (selectedItem.id) {
            case 1:
                return <UserInfo />;
            case 2:
                return <UserFavorite onMapView={onMapView} />;
            default:
                return <div>선택된 항목이 없습니다.</div>;
        }
    };

    // Toggle mobile menu drawer
    const toggleDrawer = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <div className="relative w-screen h-screen app-full-height flex items-center justify-center py-2 px-2 bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Back Button (Absolute positioned) */}
            <div className="absolute bottom-4 left-4 z-20">
                <button
                    className="bg-white shadow-md px-6 py-3 text-indigo-500 font-semibold rounded-full hover:bg-indigo-500 hover:text-white transition"
                    onClick={() => window.fullpage_api?.moveSlideLeft()}
                >
                    ← 맵으로
                </button>
            </div>

            {/* Main Container with Glass Effect */}
            <div className="w-full h-5/6 max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-xl bg-white/80 backdrop-blur-sm border border-white/50 flex flex-col">
                <div className="flex flex-col md:flex-row h-full overflow-hidden">
                    {/* Mobile Header with Menu Toggle */}
                    {isMobile && (
                        <div className="flex justify-between items-center bg-indigo-600 text-white p-4 sticky top-0 z-20">
                            <h2 className="text-xl font-bold flex items-center">
                                <span className="mr-2 text-xl">
                                    {selectedItem.icon}
                                </span>
                                {selectedItem.title}
                            </h2>
                            <button
                                onClick={toggleDrawer}
                                className="p-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 transition-colors flex items-center"
                            >
                                <span className="mr-1">
                                    {mobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
                                </span>
                                <svg
                                    className={`w-4 h-4 transition-transform duration-300 ${mobileMenuOpen ? "rotate-180" : ""}`}
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
                        </div>
                    )}

                    {/* Mobile Menu Drawer - Animated with Framer Motion */}
                    <AnimatePresence>
                        {isMobile && mobileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-x-0 top-16 z-50 bg-white shadow-lg rounded-b-2xl overflow-hidden"
                            >
                                <ul className="py-2">
                                    {listItems.map((item) => (
                                        <li
                                            key={item.id}
                                            className={`p-4 cursor-pointer transition-colors ${
                                                selectedItem.id === item.id
                                                    ? "bg-indigo-50 text-indigo-700 font-medium"
                                                    : "hover:bg-gray-50 text-gray-700"
                                            }`}
                                            onClick={() =>
                                                handleSelectItem(item)
                                            }
                                        >
                                            <div className="flex items-center">
                                                <span className="text-xl mr-3">
                                                    {item.icon}
                                                </span>
                                                <span>{item.title}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Desktop Sidebar - Always visible on larger screens */}
                    {!isMobile && (
                        <div className="w-64 border-r border-gray-200 h-full bg-white/90 backdrop-blur-sm flex-shrink-0 overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-indigo-700 mb-6">
                                    마이페이지
                                </h2>
                                <nav>
                                    {listItems.map((item) => (
                                        <button
                                            key={item.id}
                                            className={`w-full text-left mb-2 p-3 rounded-xl transition-all duration-300 flex items-center shadow ${
                                                selectedItem.id === item.id
                                                    ? "bg-indigo-100 text-indigo-700 font-medium shadow-sm"
                                                    : "bg-white text-gray-700 hover:bg-gray-100"
                                            }`}
                                            onClick={() =>
                                                handleSelectItem(item)
                                            }
                                        >
                                            <span className="text-xl mr-3">
                                                {item.icon}
                                            </span>
                                            <span>{item.title}</span>
                                            {selectedItem.id === item.id && (
                                                <span className="ml-auto">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5 text-indigo-600"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="flex-1 h-full flex flex-col overflow-hidden">
                        {/* Desktop Header */}
                        {!isMobile && (
                            <div className="p-6 border-b border-gray-200 flex-shrink-0">
                                <div className="flex items-center">
                                    <span className="text-2xl mr-3">
                                        {selectedItem.icon}
                                    </span>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {selectedItem.title}
                                    </h2>
                                </div>
                            </div>
                        )}

                        {/* Content Area with Animation */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedItem.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.3 }}
                                className="flex-1 overflow-y-auto p-4 md:p-6"
                            >
                                {renderSelectedComponent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
