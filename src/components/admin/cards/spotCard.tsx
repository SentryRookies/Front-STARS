// src/components/admin/cards/spotCard.tsx
import { useMemo } from "react";
import CongestionTag from "./CongestionTag";
import { useMediaQuery } from "../../../hooks/useMediaQuery";

type LongNameSpotCardProps = {
    area_nm: string;
    area_cd: string;
    area_congest_lvl: string;
    onClick?: () => void; // Add onClick prop
};

/**
 * 긴 관광지명을 위한 최적화된 SpotCard
 * 모바일 및 데스크탑 환경에서 긴 이름을 효과적으로 표시
 */
const SpotCard = ({
    area_nm,
    area_cd,
    area_congest_lvl,
    onClick, // Include onClick in props
}: LongNameSpotCardProps) => {
    const isMobile = useMediaQuery("(max-width: 768px)");

    // 이름 처리: 괄호가, 콤마 등이 있을 경우 분리하여 처리
    const { mainName, subName } = useMemo(() => {
        // 괄호 안의 내용 추출 패턴
        const bracketPattern = /(.+?)(\((.+?)\))/;
        const match = area_nm.match(bracketPattern);

        if (match) {
            return {
                mainName: match[1].trim(), // 괄호 앞 부분
                subName: match[3].trim(), // 괄호 안 부분
            };
        }

        // 하이픈이나 콤마로 구분된 경우
        if (area_nm.includes("-") || area_nm.includes(",")) {
            const parts = area_nm.split(/[-,]/);
            return {
                mainName: parts[0].trim(),
                subName: parts.slice(1).join(", ").trim(),
            };
        }

        // 단어 수에 따른 분리 (매우 긴 경우)
        if (area_nm.length > 12) {
            const words = area_nm.split(" ");
            const halfLength = Math.ceil(words.length / 2);

            return {
                mainName: words.slice(0, halfLength).join(" "),
                subName: words.slice(halfLength).join(" "),
            };
        }

        return { mainName: area_nm, subName: "" };
    }, [area_nm]);

    // 글자 크기 및 레이아웃 최적화
    const getMainNameClass = () => {
        if (mainName.length > 10) {
            return isMobile ? "text-xs leading-tight" : "text-sm leading-tight";
        }
        if (mainName.length > 6) {
            return isMobile
                ? "text-sm leading-tight"
                : "text-base leading-tight";
        }
        return isMobile ? "text-base" : "text-lg";
    };

    const getSubNameClass = () => {
        return isMobile ? "text-[10px] leading-none" : "text-xs leading-tight";
    };

    return (
        <div
            className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={onClick} // Use the onClick prop here
        >
            <div className="flex justify-between items-start">
                <div className="max-w-[75%]">
                    <div
                        className={`font-bold text-black ${getMainNameClass()}`}
                    >
                        {mainName}
                    </div>
                    {subName && !isMobile && (
                        <div
                            className={`text-gray-700 mt-0.5 ${getSubNameClass()}`}
                        >
                            ({subName})
                        </div>
                    )}
                </div>
                <CongestionTag
                    level={area_congest_lvl}
                    size={isMobile ? "xs" : "sm"}
                />
            </div>
            <div className="text-gray-500 text-xs mt-1">{area_cd}</div>
        </div>
    );
};

export default SpotCard;
