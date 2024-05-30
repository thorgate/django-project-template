import clsx from "clsx";

export interface CustomInputProps {
    label?: string;
    error?: string;
    children: React.ReactNode;
}

export const CustomInput = ({ label, error, children }: CustomInputProps) => {
    return (
        <div
            className={clsx("flex flex-col", error && "mb-4", !error && "mb-5")}
        >
            {label ? (
                <label className="font-semibold text-sm text-gray-600 dark:text-white pb-1 block">
                    {label}
                </label>
            ) : null}
            {children}
            {error ? (
                <span className="text-red-500 text-xs">{error}</span>
            ) : null}
        </div>
    );
};
