import PlaceSuggestionShow from "../../user/Sugestion/PlaceSuggestionShow";
import { useState, useRef, useEffect } from "react";

export default function PlaceSuggestionBtn({

}){
    const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

    const toggleSuggestion = () => {
        setIsSuggestionOpen((prev) => !prev);
    };

    // 닫기 핸들러 추가
    const handleClose = () => {
        console.log("닫기 함수 호출됨");
        setIsSuggestionOpen(false);
    };


   return(
        <div>
            <div
                className={`absolute bottom-8 transform left-4 z-20 max-w-md bg-white shadow-md flex items-center rounded-full transition-all duration-300 ${
                    isSuggestionOpen
                        ? "bg-opacity-90"
                        : "bg-opacity-60 hover:bg-opacity-90"
                } md:bottom-8 md:left-6 md:transform-none md:w-88`}
            >
                <button
                className="flex-shrink-0 bg-transparent text-gray-500 hover:text-gray-700 mr-3 focus:outline-none border-0
                font-bold text-center bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent"
                onClick={toggleSuggestion}>
                    여행코스 ❯
                </button>
                <PlaceSuggestionShow isOpen={isSuggestionOpen}
                 onClose={handleClose} />         

            </div>
        </div>
   ) 
}