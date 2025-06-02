// src/components/admin/cards/CongestionTag.tsx
import { useMediaQuery } from "../../../hooks/useMediaQuery";

type CongestionTagProps = {
    level: string;
    size?: "xs" | "sm" | "md" | "lg";
};

/**
 * 혼잡도 태그 컴포넌트
 * 혼잡도 레벨에 따라 다른 색상과 텍스트를 표시
 */
const CongestionTag = ({ level, size = "md" }: CongestionTagProps) => {
    const isMobile = useMediaQuery("(max-width: 768px)");

    // 혼잡도 레벨에 따른 스타일 결정 (그라데이션 + 연한 그림자 효과)
    const getStyles = () => {
        switch (level) {
            case "여유":
                return "bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md shadow-emerald-100";
            case "보통":
                return "bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-md shadow-blue-100";
            case "약간 붐빔":
                return "bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md shadow-orange-100";
            case "붐빔":
                return "bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-md shadow-red-100";
            default:
                return "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md shadow-gray-100";
        }
    };

    // 텍스트 크기 및 여백 결정
    const getSizeClass = () => {
        // 모바일 환경에서는 더 작은 크기 사용
        if (isMobile) {
            switch (size) {
                case "xs":
                    return "text-[10px] py-0.5 px-1.5";
                case "sm":
                    return "text-[11px] py-0.5 px-2";
                case "md":
                    return "text-xs py-1 px-2";
                case "lg":
                    return "text-sm py-1 px-3";
                default:
                    return "text-xs py-1 px-2";
            }
        }

        // 데스크톱 환경의 크기
        switch (size) {
            case "xs":
                return "text-xs py-0.5 px-1.5";
            case "sm":
                return "text-xs py-1 px-2";
            case "md":
                return "text-sm py-1 px-3";
            case "lg":
                return "text-base py-1.5 px-4";
            default:
                return "text-sm py-1 px-3";
        }
    };

    // 모바일 환경에서 혼잡도 텍스트 약어 처리
    const getDisplayText = () => {
        if (isMobile && size === "xs") {
            switch (level) {
                case "여유":
                    return "여유";
                case "보통":
                    return "보통";
                case "약간 붐빔":
                    return "약붐";
                case "붐빔":
                    return "붐빔";
                default:
                    return level;
            }
        }
        return level;
    };

    return (
        <div
            className={`
                    rounded-lg
                    ${getStyles()} 
                    ${getSizeClass()}
                    font-semibold whitespace-nowrap
                    transform transition-transform duration-200 hover:scale-105
                    backdrop-blur-sm
                `}
        >
            {getDisplayText()}
        </div>
    );
};

export default CongestionTag;
