import { useForm } from "react-hook-form";
import * as React from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { useTranslation } from "next-i18next";

import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { Spinner } from "@components/Spinner";
import { useSessionIsValid } from "@lib/hooks/session";

interface LoginFormValues {
    email: string;
    password: string;
}

interface LoginFormProps {
    csrfToken: string | null;
}

export const LoginForm = ({ csrfToken }: LoginFormProps) => {
    const { t } = useTranslation(["auth", "common"]);
    const { reload } = useRouter();
    const sessionIsValid = useSessionIsValid();
    const [isRedirecting, setIsRedirecting] = React.useState<"no" | "waiting">(
        "no",
    );

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
    const onSubmit = async (data: LoginFormValues) => {
        const result = await signIn("credentials", {
            redirect: false,
            email: data.email,
            password: data.password,
        });

        if (!result?.ok) {
            setError("root", { message: t("auth:error.invalidCredentials") });
        } else {
            setIsRedirecting("waiting");
        }
    };

    React.useEffect(() => {
        if (sessionIsValid && isRedirecting === "waiting") {
            void reload();
        }
    }, [sessionIsValid, reload, isRedirecting]);

    const disabled = React.useMemo(
        () =>
            isSubmitting ||
            isRedirecting !== "no" ||
            sessionIsValid === undefined ||
            sessionIsValid,
        [sessionIsValid, isSubmitting, isRedirecting],
    );

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
                disabled={disabled}
            />
            <Input
                id="password"
                label={t("auth:form.password")}
                type="password"
                error={errors.password?.message}
                {...register("password", {
                    required: t("common:form.field.required"),
                })}
                disabled={disabled}
            />
            <div className="flex flex-row w-full">
                <Button
                    type="submit"
                    className="bg-brand-dark text-white font-bold basis-1/2"
                    disabled={disabled || isValidating || !isValid}
                >
                    {t("auth:form.submit")}
                </Button>
                {disabled ? (
                    <div className="basis-1/2 my-auto px-3 ">
                        <Spinner />
                    </div>
                ) : null}
            </div>
        </form>
    );
};
