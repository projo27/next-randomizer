export function HeadsIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="100"
            viewBox="0 0 100 100"
            className="text-primary"
        >
            <circle cx="50" cy="50" r="45" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="2" />
            <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize="40"
                fontWeight="bold"
                fill="hsl(var(--primary-foreground))"
            >
                H
            </text>
        </svg>
    );
}
