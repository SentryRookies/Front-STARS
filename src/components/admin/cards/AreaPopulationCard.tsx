import React from "react";

interface PopulationProps {
    population: {
        area_ppltn_min: number;
        area_ppltn_max: number;
    };
}

const AreaPopulationCard = ({ population }: PopulationProps) => {
    // Calculate the average population
    const averagePopulation = Math.round(
        (population.area_ppltn_min + population.area_ppltn_max) / 2
    );

    return (
        <div className="bg-white p-3 rounded-lg shadow flex items-center h-32">
            <div className="w-full">
                <h3 className="font-semibold text-sm text-gray-500 mb-1">
                    현재 인구 추이
                </h3>
                <div className="flex flex-col justify-between">
                    <p className="text-black font-bold text-3xl">
                        약 {averagePopulation.toLocaleString()}명
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                        (범위: {population.area_ppltn_min.toLocaleString()}명 ~{" "}
                        {population.area_ppltn_max.toLocaleString()}명)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AreaPopulationCard;
