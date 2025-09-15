export function TailsIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="100"
            viewBox="0 0 100 100"
            className="text-primary"
        >
            <circle cx="50" cy="50" r="45" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="2.5" />
            <g transform="translate(0, 5) scale(0.9)" fill="hsl(var(--primary-foreground))" stroke="hsl(var(--primary-foreground))" strokeWidth="2">
                <path d="M 50,20 L 70,30 L 70,50 C 70,70 50,80 50,80 C 50,80 30,70 30,50 L 30,30 Z" />
                <path d="M 40,45 L 60,45" strokeWidth="4" />
                <path d="M 50,35 L 50,55" strokeWidth="4" />
            </g>
             <text
                x="50%"
                y="88%"
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill="hsl(var(--primary-foreground))"
            >
                TAILS
            </text>
        </svg>
    );
}
