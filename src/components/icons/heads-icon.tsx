export function HeadsIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="100"
            viewBox="0 0 100 100"
            className="text-primary"
        >
            <circle cx="50" cy="50" r="45" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="2.5" />
            <g transform="translate(0, 5) scale(0.9)" fill="hsl(var(--primary-foreground))">
                <path d="M 63.3,20.4 C 61.3,18.3 58.6,17 55.7,17 c -2.3,0 -4.4,0.8 -6.2,2.2 c -2.5,2 -4.2,5.2 -4.8,8.8 c -0.2,1.3 -0.2,2.7 -0.2,4.1 c 0,4.2,0.6,8.4,1.8,12.4 C 47.5,48.2 49,51.8 51.5,55 c 1.9,2.4,4,4,6.4,5.1 l 0,0 c 1.7,0.8,3.5,1.2,5.3,1.2 c 1.8,0,3.5,-0.4,5.3,-1.2 c 2.4,-1.1,4.5,-2.7,6.4,-5.1 c 2.5,-3.2,4,-6.8,5.2,-10.5 c 1.2,-4,1.8,-8.2,1.8,-12.4 c 0,-1.4,0,-2.8,-0.2,-4.1 C 77.5,22.2,75.8,19,73.3,17 C 71.5,15.8 69.4,15 67.1,15 c -2.9,0 -5.6,1.3 -7.6,3.4" stroke="hsl(var(--primary-foreground))" strokeWidth="2" fill="none" />
                <path d="M 61.4,61.3 c 0,0 2.2,-1.3 2.2,-4.1 c 0,-2.8 -2.2,-4.1 -2.2,-4.1" stroke="hsl(var(--primary-foreground))" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M 50,65 C 50,65 52,48 60,48" stroke="hsl(var(--primary-foreground))" strokeWidth="2" fill="none" />
                <path d="M 68,26 c 0,0 -2,1 -4,1 s -4,-1 -4,-1" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" fill="none" />
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
                HEADS
            </text>
        </svg>
    );
}
