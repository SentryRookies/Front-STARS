// Category mappings
export const categoryMap: Record<string, string> = {
    accommodation: "숙박",
    attraction: "관광명소",
    cafe: "카페",
    restaurant: "음식점",
    culturalevent: "문화행사",
};

// Type styles with color and icon definitions
export const typeStyles: Record<
    string,
    { color: string; bgColor: string; icon: string }
> = {
    accommodation: {
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        icon: "🏨",
    },
    attraction: {
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        icon: "🎭",
    },
    cafe: {
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        icon: "☕",
    },
    restaurant: {
        color: "text-red-600",
        bgColor: "bg-red-50",
        icon: "🍽️",
    },
    culturalevent: {
        color: "text-violet-600",
        bgColor: "bg-violet-50",
        icon: "🎫",
    },
};

// Default style for fallback
export const defaultStyle = {
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    icon: "📍",
};

/**
 * Get style information for a specific type
 * @param type - The category type
 * @returns The style object for the specified type or default style if not found
 */
export const getTypeStyle = (type: string) => {
    return typeStyles[type] || defaultStyle;
};