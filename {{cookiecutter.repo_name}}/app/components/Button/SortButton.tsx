import React, { useState } from "react";
import clsx from "clsx";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

export interface SortToggleButtonProps {
    onToggleSort: () => void;
    label: React.ReactNode;
    isActive: boolean;
    className?: string;
    innerClassName?: string;
    labelClassName?: string;
}

export function SortToggleButton({
    onToggleSort,
    label,
    isActive,
    className = "flex w-full",
    innerClassName = "h-5 w-5 text-gray-300 mr-2",
    labelClassName = "grow text-left",
}: SortToggleButtonProps) {
    const [sortAscending, setSortAscending] = useState(true);

    const handleClick = () => {
        setSortAscending(!sortAscending);
        onToggleSort();
    };
    return (
        <button onClick={handleClick} className={className}>
            <span className={clsx(labelClassName, isActive && "underline")}>
                {label}
            </span>
            <span>
                {isActive && sortAscending ? (
                    <ChevronDownIcon className={innerClassName} />
                ) : null}
                {isActive && !sortAscending ? (
                    <ChevronUpIcon className={innerClassName} />
                ) : null}
            </span>
        </button>
    );
}
