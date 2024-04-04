import clsx from "clsx";
import React from "react";
import Link from "next/link";

export interface ButtonProps {
    id?: string;

    variant?: "primary" | "secondary";

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
        "tw-p-2 tw-rounded",
        variant === "primary" &&
            "tw-bg-blue-600 tw-text-gray-200 hover:tw-bg-blue-500 hover:tw-text-gray-100",
        variant === "secondary" &&
            "tw-bg-transparent tw-text-gray-800 border tw-border-gray-300 hover:tw-bg-gray-100 hover:tw-text-gray-700",
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
