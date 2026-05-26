import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

export interface SortToggleButtonProps {
    onToggleSort: () => void;
    label: string;
    isActive: boolean;
}

export function SortToggleButton({
    onToggleSort,
    label,
    isActive,
}: SortToggleButtonProps) {
    const [sortAscending, setSortAscending] = useState(true);

    const handleClick = () => {
        setSortAscending(!sortAscending);
        onToggleSort();
    };
    const className = `h-5 w-5 text-gray-300 mr-2`;

    return (
        <button onClick={handleClick} className="flex w-full">
            <span className="grow text-left">{label}</span>
            <span>
                {isActive && sortAscending ? (
                    <ChevronDownIcon className={className} />
                ) : null}
                {isActive && !sortAscending ? (
                    <ChevronUpIcon className={className} />
                ) : null}
            </span>
        </button>
    );
}
