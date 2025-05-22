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

    // 혼잡도 레벨에 따른 배경색, 텍스트 색상, 테두리 색상 결정
    const getStyles = () => {
        switch (level) {
            case "여유":
                return "bg-green-50 text-green-600 border-green-200";
            case "보통":
                return "bg-yellow-50 text-yellow-600 border-yellow-200";
            case "약간 붐빔":
                return "bg-orange-50 text-orange-600 border-orange-200";
            case "붐빔":
                return "bg-red-50 text-red-600 border-red-200";
            default:
                return "bg-gray-50 text-gray-600 border-gray-200";
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
                    rounded-full border 
                    ${getStyles()} 
                    ${getSizeClass()}
                    font-medium whitespace-nowrap
                `}
        >
            {getDisplayText()}
        </div>
    );
};

export default CongestionTag;
