// Category mappings
export const categoryMap: Record<string, string> = {
    accommodation: "숙박",
    attraction: "관광명소",
    cafe: "카페",
    restaurant: "음식점",
};

// Type styles with color and icon definitions
export const typeStyles: Record<
    string,
    { color: string; bgColor: string; icon: string; borderColor: string }
> = {
    accommodation: {
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        icon: "🏨",
        borderColor: "border-blue-200",
    },
    attraction: {
        color: "text-green-600",
        bgColor: "bg-green-50",
        icon: "🎭",
        borderColor: "border-green-200",
    },
    cafe: {
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        icon: "☕",
        borderColor: "border-yellow-200",
    },
    restaurant: {
        color: "text-red-600",
        bgColor: "bg-red-50",
        icon: "🍽️",
        borderColor: "border-red-200",
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
