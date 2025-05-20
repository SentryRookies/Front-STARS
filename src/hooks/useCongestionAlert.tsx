import { useEffect, useRef, useState } from "react";
import { subscribeCongestionAlert } from "../api/starsApi";
import { CongestionAlert, AlertType } from "../components/alert/AlertModal";

let alertId = 0;

function getAlertType(lvl: string): AlertType | null {
    if (lvl === "붐빔") return "danger";
    // 3단계를 지금 포함시키기엔 너무 많음. 다른방법 간구해봐야할듯
    if (lvl === "약간 붐빔") return "warning";
    return null;
}

export default function useCongestionAlert() {
    const [alerts, setAlerts] = useState<CongestionAlert[]>([]);
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        eventSourceRef.current = subscribeCongestionAlert((data) => {
            const alertsArray = Array.isArray(data) ? data : [data];
            const newAlerts: CongestionAlert[] = alertsArray
                .map((item) => {
                    const type = getAlertType(item.area_congest_lvl as string);
                    if (!type) return null;
                    return {
                        id: ++alertId,
                        area_nm: item.area_nm as string,
                        area_id: item.area_id as number,
                        area_congest_lvl: item.area_congest_lvl as string,
                        area_congest_msg: item.area_congest_msg as string,
                        ppltn_time: item.ppltn_time as string,
                        type,
                    } as CongestionAlert;
                })
                .filter(Boolean) as CongestionAlert[];

            setAlerts((prev) => {
                // 완전히 동일한 알림 배열이면 상태 변경하지 않음
                const isSame =
                    prev.length === newAlerts.length &&
                    prev.every(
                        (a, i) =>
                            a.area_id === newAlerts[i].area_id &&
                            a.area_congest_lvl ===
                                newAlerts[i].area_congest_lvl &&
                            a.area_congest_msg === newAlerts[i].area_congest_msg
                    );
                return isSame ? prev : newAlerts;
            });
        });
        return () => {
            eventSourceRef.current?.close();
        };
    }, []);

    const dismissAlert = (id: number) => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
    };

    return { alerts, dismissAlert };
}
