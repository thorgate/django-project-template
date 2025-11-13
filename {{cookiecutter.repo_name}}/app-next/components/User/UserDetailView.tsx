import React from "react";
import Head from "next/head";

import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { toast } from "react-toastify";
import {
    PatchedUserDetailRequest,
    queriesApi,
    UserDetail,
    UserPartialUpdateApiArg,
} from "@lib/queries";

import { DetailViewPropsFromEndpoint } from "@lib/factories/types";
import { isMutationResultError, useApiBasedForm } from "@lib/factories/hooks";
import { UserDetailForm } from "@components/User/UserDetailForm";
import { useExtractNonFieldError } from "@lib/convertError";

export const UserDetailView = ({
    data: user,
}: DetailViewPropsFromEndpoint<typeof queriesApi.endpoints.userRetrieve>) => {
    const router = useRouter();
    const { t } = useTranslation(["user", "common"]);
    const onSuccess = React.useCallback(
        (user: UserDetail) => {
            toast.success(t("user:updated", { name: user.name }));
            void router.push("/users");
        },
        [t, router],
    );
    const onCancel = React.useCallback(() => router.push("/users"), [router]);
    const makeQueryArgs = React.useCallback(
        (values: PatchedUserDetailRequest): UserPartialUpdateApiArg => ({
            email: user.email,
            patchedUserDetailRequest: values,
        }),
        [user.email],
    );
    const formProps = React.useMemo(
        () => ({ defaultValues: { name: user.name } }),
        [user.name],
    );
    const form = useApiBasedForm({
        endpoint: queriesApi.endpoints.userPartialUpdate,
        makeQueryArgs,
        onSuccess,
        formProps,
    });

    const [triggerDelete] = queriesApi.endpoints.userDestroy.useMutation();
    const extractNonFieldError = useExtractNonFieldError();

    const onDelete = React.useCallback(() => {
        triggerDelete({ email: user.email }).then((result) => {
            if (isMutationResultError(result)) {
                const { error } = result;
                const nonFieldErrors = extractNonFieldError(error);
                toast.error(nonFieldErrors);
            } else {
                toast.success(t("user:deleted", { name: user.name }));
                onCancel();
            }
        });
    }, [
        t,
        extractNonFieldError,
        user.name,
        user.email,
        onCancel,
        triggerDelete,
    ]);

    return (
        <>
            <Head>
                <title>{`${t("common:pageTitles.userDetails", {
                    name: user.name,
                })} - {{ cookiecutter.project_title }}`}</title>
            </Head>
            <UserDetailForm
                title={t("user:titleUpdate", { name: user.name })}
                onCancel={onCancel}
                onDelete={onDelete}
                form={form}
                user={user}
            />
        </>
    );
};
