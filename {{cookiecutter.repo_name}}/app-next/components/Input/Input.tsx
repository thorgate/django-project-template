import * as React from "react";
import clsx from "clsx";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/20/solid";

import { useTranslation } from "next-i18next";
import { InputWrapper } from "@components/Input/InputWrapper";
import { inputClassNames } from "@components/Input/style";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: React.ReactNode;
    error?: string;
    Icon?: typeof MagnifyingGlassIcon;
    onClear?: () => void;
}

export const Input = React.forwardRef(
    (
        {
            label,
            error,
            disabled,
            className,
            Icon,
            onClear,
            ...props
        }: InputProps,
        ref: React.ForwardedRef<HTMLInputElement>
    ) => {
        const { t } = useTranslation("common");

        return (
            <InputWrapper label={label} error={error}>
                {({ id }) => (
                    <div
                        className={inputClassNames({
                            error: Boolean(error),
                            disabled,
                            className: "flex group py-0 pr-0 overflow-hidden",
                            padding: false,
                        })}
                    >
                        {Icon ? (
                            <Icon
                                className="h-5 w-5 my-auto text-brand-dark dark:text-brand-light ml-2"
                                aria-hidden="true"
                            />
                        ) : null}
                        <div className="grow flex">
                            <input
                                {...props}
                                ref={ref}
                                disabled={disabled}
                                id={id}
                                className={inputClassNames({
                                    error: Boolean(error),
                                    disabled,
                                    className: clsx(
                                        "w-full ring-0 focus:ring-0 rounded-md m-[2px] pr-[calc(0.5rem-2px)] py-[calc(0.5rem-2px)]",
                                        Icon
                                            ? "pl-[calc(0.25rem-2px)]"
                                            : "pl-[calc(0.75rem-2px)]",
                                        className
                                    ),
                                    rounded: false,
                                    margin: false,
                                    padding: false,
                                    ring: false,
                                })}
                            />
                        </div>
                        {onClear ? (
                            <button
                                type="button"
                                onClick={onClear}
                                disabled={disabled}
                                tabIndex={-1}
                                className="clear-button"
                                aria-label={t("labels.clear")}
                            >
                                <XMarkIcon className="clear-button-icon" />
                            </button>
                        ) : null}{" "}
                    </div>
                )}
            </InputWrapper>
        );
    }
);

Input.displayName = "Input";
