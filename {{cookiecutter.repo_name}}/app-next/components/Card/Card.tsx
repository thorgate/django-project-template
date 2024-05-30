import clsx from "clsx";
import React from "react";

export interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export function Card({ children, className }: CardProps) {
    return (
        <div
            className={clsx(
                "bg-white dark:bg-slate-700 shadow w-full rounded-lg divide-y divide-gray-200",
                className
            )}
        >
            {children}
        </div>
    );
}
