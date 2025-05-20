import { motion } from "framer-motion";
import React from "react";

interface Attraction {
    name: string;
    address: string;
    phone?: string;
    homepage_url?: string;
}

interface AttractionCardProps {
    attraction: Attraction;
    style: { opacity: number; y: number; scale: number };
    cardRef: (el: HTMLDivElement | null) => void;
}

export default function AttractionCard({
    attraction,
    style,
    cardRef,
}: AttractionCardProps) {
    return (
        <motion.div
            className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 bg-orange-500 rounded-3xl shadow-lg p-4 my-2"
            whileHover={{ y: -6 }}
            animate={style}
            style={style}
            ref={cardRef}
        >
            <p className="text-md text-gray-200">관광지</p>
            <p className="text-2xl font-bold text-white">{attraction.name}</p>
            <p className="text-sm text-gray-100 mt-1">{attraction.address}</p>
            {attraction.phone && (
                <p className="text-sm text-gray-100 mt-1">
                    ☎ {attraction.phone}
                </p>
            )}
            {attraction.homepage_url && (
                <a
                    href={`https://${attraction.homepage_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-yellow-300 mt-1 underline block"
                >
                    홈페이지 방문
                </a>
            )}
        </motion.div>
    );
}
