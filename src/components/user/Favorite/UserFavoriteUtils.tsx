import React from "react";
import {
    Hotel,
    MapPin,
    Coffee,
    UtensilsCrossed,
    Camera,
    BedDouble,
    Landmark,
} from "lucide-react";

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
    {
        color: string;
        bgColor: string;
        icon: React.ReactNode;
        borderColor: string;
        iconComponent: React.ComponentType<{
            size?: number;
            className?: string;
        }>;
    }
> = {
    accommodation: {
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        icon: <BedDouble size={16} className="inline-block" />,
        borderColor: "border-blue-200",
        iconComponent: Hotel,
    },
    attraction: {
        color: "text-green-600",
        bgColor: "bg-green-50",
        icon: <Landmark size={16} className="inline-block" />,
        borderColor: "border-green-200",
        iconComponent: Camera,
    },
    cafe: {
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        icon: <Coffee size={16} className="inline-block" />,
        borderColor: "border-yellow-200",
        iconComponent: Coffee,
    },
    restaurant: {
        color: "text-red-600",
        bgColor: "bg-red-50",
        icon: <UtensilsCrossed size={16} className="inline-block" />,
        borderColor: "border-red-200",
        iconComponent: UtensilsCrossed,
    },
};

export const defaultStyle = {
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    icon: <MapPin size={16} className="inline-block" />,
    borderColor: "border-gray-200",
    iconComponent: MapPin,
};

export const getTypeStyle = (type: string) => {
    return typeStyles[type] || defaultStyle;
};

// Helper function to get icon with custom size
export const getTypeIcon = (
    type: string,
    size: number = 16,
    className?: string
) => {
    const style = getTypeStyle(type);
    const IconComponent = style.iconComponent;
    return (
        <IconComponent
            size={size}
            className={`inline-block ${className || ""}`}
        />
    );
};

// Helper function to create inline icon with text
export const getInlineIconWithText = (
    type: string,
    text: string,
    iconSize: number = 16
) => {
    const style = getTypeStyle(type);
    const IconComponent = style.iconComponent;

    return (
        <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <IconComponent size={iconSize} className="flex-shrink-0" />
            <span>{text}</span>
        </span>
    );
};

// Helper function to get icon component class
export const getTypeIconComponent = (type: string) => {
    const style = getTypeStyle(type);
    return style.iconComponent;
};
