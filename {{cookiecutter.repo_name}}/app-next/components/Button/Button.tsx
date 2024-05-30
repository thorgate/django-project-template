import clsx from "clsx";
import React from "react";
import Link from "next/link";

export interface ButtonProps {
    id?: string;

    variant?: "primary" | "secondary" | "danger" | "safe" | "minimal";

    href?: string;

    children: React.ReactNode;

    className?: string;

    type?: "button" | "submit" | "reset";

    onClick?: () => void;

    disabled?: boolean;
}

export function Button({
    id,
    variant = "primary",
    href,
    type,
    children,
    className,
    onClick,
    disabled,
}: ButtonProps) {
    const classNames = clsx(
        "focus:ring-2 focus:ring-inset focus:ring-indigo-600 outline-none",
        variant !== "minimal" && "p-2 rounded",
        variant === "primary" &&
            "bg-blue-600 text-gray-200 hover:bg-blue-500 hover:text-gray-100",
        variant === "secondary" &&
            "bg-transparent text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 hover:dark:text-gray-300",
        variant === "danger" && "bg-red-600 text-gray-200 hover:bg-red-700",
        variant === "safe" && "bg-green-600 text-gray-200 hover:bg-green-700",
        disabled && "opacity-50 cursor-not-allowed",
        className
    );

    if (href) {
        return (
            <Link className={classNames} href={href}>
                {children}
            </Link>
        );
    }

    return (
        <button
            id={id}
            className={classNames}
            type={type}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
