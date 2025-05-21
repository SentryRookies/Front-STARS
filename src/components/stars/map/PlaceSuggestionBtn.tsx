import React, { useState, useRef, useEffect } from "react";
import PlaceSuggestionShow from "../../user/Sugestion/PlaceSuggestionShow";

interface PlaceSuggestionBtnProps {
  // 필요한 경우 추가 props를 여기에 정의
}

export default function PlaceSuggestionBtn({}: PlaceSuggestionBtnProps) {
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
                className={`absolute bottom-8 transform left-4 z-20 max-w-md bg-white shadow-md flex items-center rounded-full transition-all duration-300 ${isSuggestionOpen
                        ? "bg-opacity-90"
                        : "bg-opacity-60 hover:bg-opacity-90"
                    } md:bottom-8 md:left-6 md:transform-none md:w-88`}
            >
                <button
                    className="flex-shrink-0 bg-transparent mr-3 focus:outline-none border-0
font-bold text-center text-purple-500"
                    onClick={toggleSuggestion}>
                    여행코스 ❯
                </button>
                <PlaceSuggestionShow isOpen={isSuggestionOpen}
                    onClose={handleClose} />
            </div>
        </div>
    )
}