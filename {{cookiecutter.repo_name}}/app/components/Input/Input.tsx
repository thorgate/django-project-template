import clsx from "clsx";
import { ForwardedRef, forwardRef, InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef(
    (
        { label, error, ...props }: InputProps,
        ref: ForwardedRef<HTMLInputElement>
    ) => {
        return (
            <div className={clsx("tw-flex tw-flex-col", error && "tw-mb-4")}>
                {label && (
                    <label
                        htmlFor={props.id}
                        className="tw-font-semibold tw-text-sm tw-text-gray-600 dark:tw-text-white tw-pb-1 tw-block"
                    >
                        {label}
                    </label>
                )}
                <input
                    {...props}
                    ref={ref}
                    className={clsx(
                        "tw-border tw-rounded-lg tw-px-3 tw-py-2 tw-mt-1 tw-mb-5 tw-text-sm tw-w-full dark:tw-bg-slate-800 dark:tw-border-slate-700 dark:tw-text-white",
                        props.className
                    )}
                />
                {error && <span className="tw-text-red-500 tw-text-xs">{error}</span>}
            </div>
        );
    }
);

Input.displayName = "Input";
