import React from "react";

interface CongestionCardProps {
    congestionLevel: string;
}

const CongestionCard = ({ congestionLevel }: CongestionCardProps) => {
    // Determine background color based on congestion level
    const getBgColor = () => {
        switch (congestionLevel) {
            case "여유":
                return "bg-green-500";
            case "보통":
                return "bg-yellow-400";
            case "약간 붐빔":
                return "bg-orange-500";
            case "붐빔":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <div
            className={`${getBgColor()} p-3 rounded-lg shadow flex items-center h-32`}
        >
            <div className="w-full">
                <h3 className="font-semibold text-sm text-white opacity-80 mb-1">
                    혼잡정도
                </h3>
                <div className="flex flex-col justify-between">
                    <p className="text-white text-3xl font-bold">
                        {congestionLevel}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CongestionCard;
