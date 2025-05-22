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
            className={`${getBgColor()} p-4 rounded-lg shadow flex items-center h-32 border border-white/20`}
        >
            <div className="w-full">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-5 bg-white/90 rounded shadow-sm"></div>
                    <h3 className="font-semibold text-sm text-white opacity-90">
                        혼잡정도
                    </h3>
                </div>
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
