export function Card({ className = '', children }) {
    return (
        <div className={`bg-white rounded-xl shadow p-4 ${className}`}>
            {children}
        </div>
    );
}

export function CardContent({ className = '', children }) {
    return <div className={`p-2 ${className}`}>{children}</div>;
}