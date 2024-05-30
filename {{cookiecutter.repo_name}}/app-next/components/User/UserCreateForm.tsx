import React from "react";
import { useTranslation } from "next-i18next";

import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { UseAPIBasedFormResult } from "@lib/factories/hooks";
import { UserCreate } from "@lib/queries";

export interface UserCreateFormProps {
    title: string;
    onCancel: () => void;
    form: UseAPIBasedFormResult<UserCreate & {
        passwordConfirm: string;
    }>;
}

export const UserCreateForm = ({
    title,
    onCancel,
    form: {
        register,
        handleSubmit,
        formState: { errors },
        isLoading,
        watch,
    },
}: UserCreateFormProps) => {
    const { t } = useTranslation(["user", "common"]);

    return (
        <form
            className="pt-9 pb-5 px-9 bg-white dark:bg-slate-900 text-black dark:text-white "
            onSubmit={handleSubmit}
        >
            <div className="space-y-12">
                <div className="border-b border-gray-900/10 pb-12">
                    <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
                        {title}
                    </h2>
                    {errors?.root ? (
                        <div className="text-red-500 text-xs">
                            {errors?.root.message}
                        </div>
                    ) : null}
                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                            <Input
                                id="name"
                                label={t("user:name")}
                                error={errors.name?.message ?? undefined}
                                disabled={isLoading}
                                {...register("name")}
                            />
                        </div>
                        <div className="sm:col-span-4">
                            <Input
                                id="email"
                                type="email"
                                label={t("user:email")}
                                error={errors.email?.message}
                                disabled={isLoading}
                                {...register("email")}
                            />
                        </div>
                        <div className="sm:col-span-4">
                            <Input
                                id="password"
                                type="password"
                                label={t("user:password")}
                                error={errors.password?.message}
                                disabled={isLoading}
                                {...register("password")}
                            />
                        </div>
                        <div className="sm:col-span-4">
                            <Input
                                id="passwordConfirm"
                                type="password"
                                label={t("user:passwordConfirm")}
                                error={errors.passwordConfirm?.message}
                                disabled={isLoading}
                                {...register("passwordConfirm", {
                                    validate: (val: string) => {
                                        if (watch("password") != val) {
                                            return t(
                                                "user:error.passwordsDoNotMatch"
                                            );
                                        }
                                    },
                                })}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-x-6">
                <Button
                    type="button"
                    variant="secondary"
                    disabled={isLoading}
                    onClick={onCancel}
                    className="px-6"
                >
                    {t("common:form.back")}
                </Button>
                <Button type="submit" disabled={isLoading} className="px-6">
                    {t("common:form.save")}
                </Button>
            </div>
        </form>
    );
};
