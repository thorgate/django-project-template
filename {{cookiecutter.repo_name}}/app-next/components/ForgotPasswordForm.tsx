import * as React from "react";
import { useTranslation } from "next-i18next";

import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { UseAPIBasedFormResult } from "@lib/factories/hooks";
import { ForgotPassword } from "@lib/queries";

interface ForgotPasswordFormProps {
    title: string;
    form: UseAPIBasedFormResult<ForgotPassword>;
}

export const ForgotPasswordForm = ({
    title,
    form: {
        register,
        handleSubmit,
        formState: { errors },
        isLoading,
    },
}: ForgotPasswordFormProps) => {
    const { t } = useTranslation(["auth", "common"]);

    return (
        <form className="px-5 pt-4 pb-7" onSubmit={handleSubmit}>
            <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 pb-3">
                {title}
            </h2>

            {errors?.root?.message ? (
                <p className="text-red-500 text-xs">{errors?.root?.message}</p>
            ) : null}

            <Input
                id="email"
                label={t("auth:form.email")}
                type="email"
                placeholder="user@example.com"
                error={errors.email?.message}
                {...register("email", {
                    required: t("common:form.field.required"),
                })}
            />

            <Button type="submit" disabled={isLoading}>
                {t("auth:forgotPassword.submit")}
            </Button>
        </form>
    );
};
