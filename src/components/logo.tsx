import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("h-10 w-10", className)}
        >
            <rect width="40" height="40" rx="12" fill="#8B5CF6" />
            {/* Book outline */}
            <path
                d="M8 12H12M8 16H12M8 20H12M20 12H24M20 16H24"
                stroke="transparent"
            />
            <g transform="translate(8, 8) scale(1)">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="m11 11 2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
        </svg>
    );
}
