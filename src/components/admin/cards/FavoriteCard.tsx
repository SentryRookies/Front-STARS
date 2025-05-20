import React from "react";
import { Favorite } from "../../../data/adminData";

interface TypeStyles {
    bg: string;
    border: string;
    text: string;
    tag: string;
    tagText: string;
    icon: string;
}
interface FavoriteCardProps {
    item: Favorite;
    typeStyles: TypeStyles;
    categoryMap: Record<string, string>;
    idType?: "favorite_id" | "place_id";
    extra?: React.ReactNode;
    children?: React.ReactNode;
}

export default function FavoriteCard({
    item,
    typeStyles,
    categoryMap,
    idType = "favorite_id",
    extra,
    children,
}: FavoriteCardProps) {
    return (
        <div
            className={`p-3 rounded-lg shadow border ${typeStyles.bg} ${typeStyles.border} hover:shadow-lg transition-shadow duration-300 h-full flex flex-col relative`}
        >
            {extra}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <span className="mr-2">{typeStyles.icon}</span>
                    <span className={`font-bold text-base ${typeStyles.text}`}>
                        {item.name}
                    </span>
                </div>
                <div className="flex gap-2 items-center">
                    <span
                        className={`text-xs px-2 py-1 rounded-full ${typeStyles.tag} ${typeStyles.tagText}`}
                    >
                        {categoryMap[item.type] ?? item.type}
                    </span>
                </div>
            </div>
            <p className="text-gray-600 text-sm mt-1 flex-1">{item.address}</p>
            <div className="mt-2 flex flex-col items-end text-right gap-1">
                {children}
                <span className="text-gray-500 text-xs">
                    {idType === "place_id"
                        ? `Place ID: ${item.place_id}`
                        : `Favorite ID: ${item.favorite_id}`}
                </span>
            </div>
        </div>
    );
}
