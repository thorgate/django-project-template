import React from "react";
import { useTranslation } from "next-i18next";

export interface ErrorStateProps {
    message?: string;
    description?: string;
}

export const ErrorState = ({ message, description }: ErrorStateProps) => {
    const { t } = useTranslation("common");
    return (
        <div className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
            <div className="text-center">
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                    {message ?? t("errors.unexpectedError")}
                </h1>
                {description ? (
                    <p className="mt-6 text-base leading-7 text-gray-600">
                        {description}
                    </p>
                ) : null}
            </div>
        </div>
    );
};
