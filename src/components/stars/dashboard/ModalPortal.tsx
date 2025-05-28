import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function ModalPortal({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mounted, setMounted] = useState(false);
    const [container] = useState(() => {
        const el = document.createElement("div");
        el.id = "modal-root";
        el.className = "fixed inset-0 z-[9999]";
        return el;
    });

    useEffect(() => {
        document.body.appendChild(container);
        setMounted(true);
        return () => {
            document.body.removeChild(container);
        };
    }, [container]);

    return mounted ? createPortal(children, container) : null;
}
