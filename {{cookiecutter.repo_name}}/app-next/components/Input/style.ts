import clsx from "clsx";

export const inputClassNames = ({
    error,
    disabled,
    className,
    rounded = true,
    ring = true,
    border = true,
    margin = true,
    padding = true,
    background = true,
    color = true,
    size = true,
}: {
    error?: boolean;
    disabled?: boolean;
    className?: string;
    rounded?: boolean;
    ring?: boolean;
    border?: boolean;
    margin?: boolean;
    padding?: boolean;
    background?: boolean;
    color?: boolean;
    size?: boolean;
}) =>
    clsx(
        "overflow-hidden",
        border && "border-0",
        padding && "px-3 py-2",
        margin && "mt-1 mb-5",
        size && "text-sm",
        !disabled && color && "text-black",
        disabled && color && "text-brand-disabled-dark",
        ring &&
            "ring-1 focus:ring-2 focus-within:ring-2 group-focus-within:ring-2 focus:ring-brand-primary-accent focus-within:ring-brand-primary-accent group-focus-within:ring-brand-primary-accent outline-none",
        rounded && "rounded-lg",
        disabled && background && "bg-brand-disabled-light",
        !disabled && background && "bg-white",
        disabled && ring && "ring-brand-disabled-dark",
        !disabled && error && ring && "ring-brand-danger",
        !disabled && !error && ring && "ring-brand-primary",
        className,
    );
