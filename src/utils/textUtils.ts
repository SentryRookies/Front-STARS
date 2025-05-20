// src/utils/textUtils.ts
// 텍스트 길이에 따라 적절한 텍스트 크기 클래스를 반환하는 유틸리티 함수

/**
 * 텍스트 길이에 따라 적절한 Tailwind 텍스트 크기 클래스를 반환합니다.
 * @param text 크기를 조절할 텍스트
 * @param isMobile 모바일 여부
 * @param defaultSize 기본 크기 (기본값: 'base')
 * @param thresholds 글자 수 임계값과 그에 따른 크기 매핑
 * @returns Tailwind 텍스트 크기 클래스
 */
export const getTextSizeClass = (
    text: string,
    isMobile: boolean,
    defaultSize: "xs" | "sm" | "base" | "lg" | "xl" = "base",
    thresholds?: {
        length: number;
        mobileSize: "xs" | "sm" | "base" | "lg";
        desktopSize: "xs" | "sm" | "base" | "lg" | "xl";
    }[]
): string => {
    // 기본 크기 설정
    let sizeClass = isMobile
        ? `text-${defaultSize}`
        : `text-${defaultSize === "base" ? "lg" : "xl"}`;

    // 사용자 정의 임계값이 없는 경우 기본 임계값 사용
    const sizeThresholds = thresholds || [
        { length: 5, mobileSize: "sm", desktopSize: "base" },
        { length: 8, mobileSize: "xs", desktopSize: "sm" },
        { length: 12, mobileSize: "xs", desktopSize: "xs" },
        { length: 16, mobileSize: "xs", desktopSize: "xs" },
    ];

    // 텍스트 길이에 따라 크기 결정
    for (const threshold of sizeThresholds) {
        if (text.length > threshold.length) {
            sizeClass = isMobile
                ? `text-${threshold.mobileSize}`
                : `text-${threshold.desktopSize}`;
        }
    }

    return sizeClass;
};

/**
 * 텍스트가 특정 길이를 초과할 때 더 작은 글꼴 크기를 추가로 적용합니다.
 * @param text 대상 텍스트
 * @param isMobile 모바일 환경 여부
 * @returns 추가 스타일 클래스
 */
export const getExtraTextStyles = (text: string, isMobile: boolean): string => {
    let extraClasses = "";

    // 모바일 환경에서는 더 작은 글자 크기 적용
    if (isMobile) {
        if (text.length > 18) {
            extraClasses += " text-[10px] leading-tight";
        } else if (text.length > 14) {
            extraClasses += " text-[11px] leading-tight";
        } else if (text.length > 10) {
            extraClasses += " text-[12px] leading-tight";
        }
    } else {
        // 데스크톱 환경에서도 매우 긴 텍스트에 대한 처리
        if (text.length > 20) {
            extraClasses += " text-[12px] leading-tight";
        } else if (text.length > 16) {
            extraClasses += " text-[13px] leading-tight";
        }
    }

    // 글자 수가 너무 많으면 word-break 적용
    if (text.length > 12) {
        extraClasses += " break-words";
    }

    return extraClasses;
};

/**
 * 텍스트에 말줄임표를 추가하거나 길이를 제한하는 함수
 * @param text 원본 텍스트
 * @param maxLength 최대 길이
 * @param addEllipsis 말줄임표 추가 여부
 * @returns 처리된 텍스트
 */
export const truncateText = (
    text: string,
    maxLength: number,
    addEllipsis: boolean = true
): string => {
    if (text.length <= maxLength) return text;

    return addEllipsis
        ? `${text.substring(0, maxLength)}...`
        : text.substring(0, maxLength);
};

/**
 * 디바이스 크기에 따라 텍스트 길이 제한 및 줄임표 처리
 * @param text 원본 텍스트
 * @param isMobile 모바일 여부
 * @param mobileMaxLength 모바일에서 최대 길이
 * @param desktopMaxLength 데스크톱에서 최대 길이
 * @returns 처리된 텍스트
 */
export const adaptiveText = (
    text: string,
    isMobile: boolean,
    mobileMaxLength: number = 10,
    desktopMaxLength: number = 20
): string => {
    const maxLength = isMobile ? mobileMaxLength : desktopMaxLength;
    return truncateText(text, maxLength, true);
};
