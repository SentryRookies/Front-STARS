import React from "react";

interface AreaNameCardProps {
    areaName: string;
    areaCode: string;
}

const AreaNameCard = ({ areaName, areaCode }: AreaNameCardProps) => {
    return (
        <div className="bg-white p-3 rounded-lg shadow flex items-center h-32">
            <div className="w-full">
                <h3 className="font-semibold text-sm text-gray-500 mb-1">
                    지역명
                </h3>
                <div className="flex flex-col justify-between">
                    <p className="text-black font-bold text-3xl">{areaName}</p>
                    <p className="text-gray-600 text-sm mt-1">{areaCode}</p>
                </div>
            </div>
        </div>
    );
};

export default AreaNameCard;
