import clsx from "clsx";
import { ForwardedRef, forwardRef, TextareaHTMLAttributes } from "react";

export interface TextAreaProps
    extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const TextArea = forwardRef(
    (
        { label, error, disabled, ...props }: TextAreaProps,
        ref: ForwardedRef<HTMLTextAreaElement>
    ) => {
        return (
            <div className={clsx("flex flex-col", error && "mb-4")}>
                {label ? (
                    <label
                        htmlFor={props.id}
                        className="font-semibold text-sm text-gray-600 dark:text-white pb-1 block"
                    >
                        {label}
                    </label>
                ) : null}
                <textarea
                    {...props}
                    ref={ref}
                    disabled={disabled}
                    className={clsx(
                        "border-0 ring-1 ring-inset rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full h-40 resize-none",
                        "text-black dark:text-white",
                        "focus:ring-2 focus:ring-inset focus:ring-indigo-600 outline-none",
                        disabled && "bg-slate-50 dark:bg-slate-600",
                        !disabled && "bg-white dark:bg-slate-800",
                        error && "ring-red-500",
                        !error && "ring-slate-300 dark:ring-slate-700",
                        props.className
                    )}
                />
                {error ? (
                    <span className="text-red-500 text-xs">{error}</span>
                ) : null}
            </div>
        );
    }
);

TextArea.displayName = "TextArea";
