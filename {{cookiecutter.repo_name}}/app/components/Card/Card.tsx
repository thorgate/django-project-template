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
                "tw-bg-white dark:tw-bg-slate-700 tw-shadow tw-w-full tw-rounded-lg tw-divide-y tw-divide-gray-200",
                className
            )}
        >
            {children}
        </div>
    );
}
