import { useForm, FieldValues } from "react-hook-form";
import * as React from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { useTranslation } from "next-i18next";

import { Button } from "@components/Button";
import { Input } from "@components/Input";

interface LoginFormValues {
    email: string;
    password: string;
}

interface LoginFormProps {
    csrfToken: string | null;
}

export const LoginForm = ({ csrfToken }: LoginFormProps) => {
    const { t } = useTranslation(["auth", "common"]);
    const { push, query, reload } = useRouter();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isValid, isSubmitting, isValidating },
    } = useForm<LoginFormValues>({
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const onSubmit = async (data: FieldValues) => {
        const result = await signIn("credentials", {
            redirect: false,
            email: data.email,
            password: data.password,
        });

        if (!result?.ok) {
            setError("root", { message: t("auth:error.invalidCredentials") });
        } else {
            await push(
                typeof query?.callbackUrl === "string"
                    ? query?.callbackUrl
                    : "/"
            );
            reload();
        }
    };

    return (
        <form className="px-5 py-7" onSubmit={handleSubmit(onSubmit)}>
            <input
                name="csrfToken"
                type="hidden"
                defaultValue={csrfToken || ""}
            />
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
            <Input
                id="password"
                label={t("auth:form.password")}
                type="password"
                error={errors.password?.message}
                {...register("password", {
                    required: t("common:form.field.required"),
                })}
            />

            <Button
                type="submit"
                disabled={isSubmitting || isValidating || !isValid}
            >
                {t("auth:form.submit")}
            </Button>
        </form>
    );
};
