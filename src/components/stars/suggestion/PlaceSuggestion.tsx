import React, { useState } from "react";
import PlaceSuggestionShow from "./PlaceSuggestionShow";

export default function PlaceSuggestion() {
    const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

    const toggleSuggestion = () => {
        setIsSuggestionOpen((prev) => !prev);
    };

    // 닫기 핸들러 추가
    const handleClose = () => {
        console.log("닫기 함수 호출됨");
        setIsSuggestionOpen(false);
    };

    return (
        <div>
            <div
                className={`absolute bottom-4 transform left-4 z-20 max-w-md bg-white shadow-md flex items-center rounded-full transition-all duration-300 md:bottom-4 md:left-4 md:transform-none md:w-88`}
            >
                <button
                    className="flex-shrink-0 px-6 py-3 bg-transparent focus:outline-none border-0 font-bold text-center text-[#24739f] flex items-center"
                    onClick={toggleSuggestion}
                >
                    <img
                        src="/chatbot.png"
                        alt="챗봇"
                        className="w-6 h-6 mr-2"
                        style={{ display: "inline-block" }}
                    />
                    <img src="/aiImage.png" alt="Ai추천" className="w-6 h-6 " />
                    추천 코스
                </button>
                <PlaceSuggestionShow
                    isOpen={isSuggestionOpen}
                    onClose={handleClose}
                />
            </div>
        </div>
    );
}
