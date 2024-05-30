import React from "react";
import { useTranslation } from "next-i18next";

export interface LoadingStateProps {
    description?: string;
}

export const LoadingState = ({ description }: LoadingStateProps) => {
    const { t } = useTranslation("common");
    return (
        <div className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
            <div
                className="text-blue-600 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status"
            >
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    {t("errors.loading")}
                </span>
            </div>
            {description ? (
                <p className="mt-6 text-base leading-7 text-gray-600">
                    {description}
                </p>
            ) : null}
        </div>
    );
};
