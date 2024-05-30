import React from "react";
import clsx from "clsx";

export const PaginationLink = ({
    onClick,
    children,
    className,
    ...rest
}: Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "type" | "disabled"
>) => (
    <button
        type="button"
        disabled={!onClick}
        onClick={onClick}
        className={clsx(
            "relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 dark:ring-gray-800",
            onClick &&
                "bg-white hover:bg-gray-50 dark:bg-slate-500 dark:hover:bg-slate-600 text-gray-900 dark:text-gray-100 focus-visible:outline-offset-0",
            !onClick &&
                "bg-gray-200 dark:bg-slate-900 text-gray-500 dark:text-gray-300",
            className
        )}
        {...rest}
    >
        {children}
    </button>
);
