import React from "react";

interface AreaNameCardProps {
    areaName: string;
    areaCode: string;
}

const AreaNameCard = ({ areaName, areaCode }: AreaNameCardProps) => {
    return (
        <div className="bg-white p-4 rounded-lg border border-white/20 shadow flex items-center h-32">
            <div className="w-full">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-5 bg-indigo-500 rounded"></div>
                    <h3 className="font-semibold text-sm text-gray-500">
                        지역명
                    </h3>
                </div>
                <div className="flex flex-col justify-between">
                    <p className="text-black font-bold text-3xl">{areaName}</p>
                    <p className="text-gray-600 text-sm mt-1">{areaCode}</p>
                </div>
            </div>
        </div>
    );
};

export default AreaNameCard;
