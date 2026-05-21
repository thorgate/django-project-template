import * as React from "react";
import clsx from "clsx";
import { Ref, TextareaHTMLAttributes } from "react";
import { inputClassNames } from "@components/Input/style";
import { InputWrapper } from "./InputWrapper";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: React.ReactNode;
    error?: string;
    className?: string;
}

export const TextArea = ({
    label,
    error,
    disabled,
    className,
    ref,
    ...props
}: TextAreaProps & { ref?: Ref<HTMLTextAreaElement> }) => {
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
                        className: clsx("w-full h-40 resize-none", className),
                    })}
                />
            )}
        </InputWrapper>
    );
};
