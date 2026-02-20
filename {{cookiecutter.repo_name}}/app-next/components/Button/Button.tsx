import clsx from "clsx";
import React from "react";
import Link from "next/link";
import { Url } from "next/dist/shared/lib/router/router";

export interface ButtonProps {
    id?: string;

    variant?: "primary" | "secondary" | "danger" | "safe" | "minimal";

    href?: Url;

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
        "focus:ring-2 focus:ring-inset focus:ring-brand-dark outline-none transition duration-500 ease-in-out",
        variant !== "minimal" && "p-2 rounded",
        variant === "primary" &&
            "bg-brand-dark text-white hover:bg-brand-primary-accent",
        variant === "secondary" &&
            "bg-transparent text-brand-primary border border-brand-dark hover:bg-brand-muted hover:text-brand-primary-accent hover:bg-opacity-25",
        variant === "danger" &&
            "bg-brand-danger text-white hover:bg-brand-danger-accent",
        variant === "safe" &&
            "bg-brand-safe text-white hover:bg-brand-safe-accent",
        disabled && "opacity-50 cursor-not-allowed",
        className,
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
