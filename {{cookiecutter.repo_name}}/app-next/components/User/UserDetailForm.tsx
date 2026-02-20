import React from "react";
import { useTranslation } from "next-i18next";

import { Button } from "@components/Button";
import { UseAPIBasedFormResult } from "@lib/factories/hooks";
import { ButtonWithConfirm } from "@components/ConfirmationDialog/ButtonWithConfirm";
import { UserDetail, UserDetailUserViewSetUpdate } from "@lib/queries";
import { CalendarInput, Input } from "@components/Input";

export interface UserDetailFormProps {
    title: string;
    onCancel: () => void;
    onDelete: () => void;
    form: UseAPIBasedFormResult<UserDetailUserViewSetUpdate>;
    user: UserDetail;
}

export const UserDetailForm = ({
    title,
    onCancel,
    onDelete,
    form: {
        register,
        handleSubmit,
        formState: { errors },
        isLoading,
    },
    user,
}: UserDetailFormProps) => {
    const { t } = useTranslation(["user", "common"]);

    return (
        <form
            className="pt-9 pb-5 px-9 bg-white dark:bg-slate-900 text-black dark:text-white min-h-full"
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
                                error={errors.name?.message}
                                disabled={isLoading}
                                {...register("name")}
                            />
                        </div>
                        <div className="sm:col-span-4 w-1/2">
                            <CalendarInput
                                label={t("user:dateJoined")}
                                value={user.created}
                                disabled={true}
                            ></CalendarInput>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-x-6">
                <ButtonWithConfirm
                    action={onDelete}
                    dialogBody={t("user:deleteConfirmation")}
                    dialogProps={{
                        title: title,
                    }}
                    buttonProps={{
                        variant: "danger",
                    }}
                    className="px-6"
                >
                    {t("user:deactivate")}
                </ButtonWithConfirm>
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
