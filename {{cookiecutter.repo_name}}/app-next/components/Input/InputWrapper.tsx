import * as React from "react";
import clsx from "clsx";

export const InputLabel: React.FC<{
    htmlFor: string;
    className: string;
    children: React.ReactNode;
}> = ({ children, ...props }) => <label {...props}>{children}</label>;

export const InputWrapper: React.FC<{
    label?: React.ReactNode;
    error?: string;
    children: (props: { id: string; error: boolean }) => React.ReactNode;
    className?: string;
    LabelComponent?: React.ComponentType<{
        htmlFor: string;
        className: string;
        children: React.ReactNode;
    }>;
}> = ({ label, error, children, className, LabelComponent = InputLabel }) => {
    const id = React.useId();
    const isError = React.useMemo(() => !!error, [error]);
    return (
        <div className={clsx("flex flex-col", className)}>
            {label ? (
                <LabelComponent
                    className="font-semibold text-sm text-brand-dark pb-1 block"
                    htmlFor={id}
                >
                    {label}
                </LabelComponent>
            ) : null}
            {children({ id, error: isError })}
            {error ? (
                <div className="text-brand-danger text-xs mb-2">{error}</div>
            ) : null}
        </div>
    );
};
