import { motion } from "framer-motion";
import { MapData } from "../../../data/adminData";
import TrafficMap from "../../admin/TrafficMapComponent";

interface TrafficInfoCardProps {
    style: { opacity: number; y: number; scale: number };
    cardRef: (el: HTMLDivElement | null) => void;
    mapData?: MapData;
}

export default function TrafficInfoCard({
    style,
    cardRef,
    mapData,
}: TrafficInfoCardProps) {
    return (
        <motion.div
            className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 bg-white rounded-3xl shadow-lg p-4 my-2"
            whileHover={{ y: -6 }}
            animate={
                style
                    ? { opacity: style.opacity, y: style.y, scale: style.scale }
                    : {}
            }
            style={style}
            ref={cardRef}
        >
            {/*<p className="text-sm text-gray-500">교통 상황</p>*/}
            {/*<p className="text-xs text-gray-400 mt-2">*/}
            {/*    예시 텍스트 예시 텍스트 예시 텍스트*/}
            {/*</p>*/}
            {mapData && (
                <TrafficMap
                    trafficData={mapData.trafficData || undefined}
                    parkData={mapData.parkData || undefined}
                />
            )}
        </motion.div>
    );
}
