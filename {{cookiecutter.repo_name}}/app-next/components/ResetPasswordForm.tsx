import * as React from "react";
import { useTranslation } from "next-i18next";

import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { UseAPIBasedFormResult } from "@lib/factories/hooks";
import { RecoveryPassword } from "@lib/queries";

interface ResetPasswordFormProps {
    title: string;
    token: string;
    form: UseAPIBasedFormResult<RecoveryPassword>;
}

export const ResetPasswordForm = ({
    title,
    token,
    form: {
        register,
        handleSubmit,
        formState: { errors },
        isLoading,
        watch,
    },
}: ResetPasswordFormProps) => {
    const { t } = useTranslation(["auth", "common"]);

    return (
        <form className="px-5 pt-4 pb-7" onSubmit={handleSubmit}>
            <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 pb-3">
                {title}
            </h2>

            {errors?.root?.message ? (
                <p className="text-red-500 text-xs">{errors?.root?.message}</p>
            ) : null}
            {errors?.uidAndTokenEncoded?.message ? (
                <p className="text-red-500 text-xs">
                    {errors?.uidAndTokenEncoded?.message}
                </p>
            ) : null}

            <Input
                id="password"
                label={t("auth:form.password")}
                type="password"
                error={errors.password?.message}
                {...register("password", {
                    required: t("common:form.field.required"),
                })}
            />

            <Input
                id="passwordConfirm"
                label={t("auth:form.passwordConfirm")}
                type="password"
                error={errors.passwordConfirm?.message}
                disabled={isLoading}
                {...register("passwordConfirm", {
                    validate: (val: string) => {
                        if (watch("password") != val) {
                            return t("auth:error.passwordsDoNotMatch");
                        }
                    },
                })}
            />
            <input
                type="hidden"
                value={token}
                {...register("uidAndTokenEncoded")}
            />

            <Button type="submit" disabled={isLoading}>
                {t("auth:resetPassword.submit")}
            </Button>
        </form>
    );
};
