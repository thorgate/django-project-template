import * as React from "react";
import clsx from "clsx";
import { ForwardedRef, forwardRef, TextareaHTMLAttributes } from "react";
import { InputWrapper } from "./InputWrapper";
import { inputClassNames } from "@components/Input/style";

export interface TextAreaProps
    extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: React.ReactNode;
    error?: string;
    className?: string;
}

export const TextArea = forwardRef(
    (
        { label, error, disabled, className, ...props }: TextAreaProps,
        ref: ForwardedRef<HTMLTextAreaElement>
    ) => {
        return (
            <InputWrapper label={label} error={error}>
                {({ id }) => (
                    <textarea
                        {...props}
                        id={id}
                        ref={ref}
                        disabled={disabled}
                        className={inputClassNames({
                            error: !!error,
                            disabled,
                            className: clsx(
                                "w-full h-40 resize-none",
                                className
                            ),
                        })}
                    />
                )}
            </InputWrapper>
        );
    }
);

TextArea.displayName = "TextArea";
