import * as React from "react";
import clsx from "clsx";
import { ArrowPathIcon } from "@heroicons/react/20/solid";

export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
    <ArrowPathIcon
        className={clsx(
            "animate-spin",
            !className && "text-brand-muted w-5 h-5",
            className,
        )}
    />
);
