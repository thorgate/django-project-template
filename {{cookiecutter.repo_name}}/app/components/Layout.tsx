import React from "react";
import { useTranslation } from "next-i18next";
import {useRouter} from "next/router";

import { Container } from "./Container";
import { NavBar } from "./NavBar";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface LayoutProps {
    children: React.ReactNode;

    authElements?: React.ReactNode;
}

export function Layout({ children, authElements }: LayoutProps) {
    const router = useRouter();
    const { t } = useTranslation("common");

    return (
        <>
            <NavBar
                navItems={[
                    {
                        label: t("pageTitles.home"),
                        href: "/",
                    },
                    {
                        label: t("pageTitles.user-details"),
                        href: "/user-details",
                    },
                    {
                        label: t("pageTitles.about"),
                        href: "/about",
                    },
                    {
                        label: t("pageTitles.errorTestPage"),
                        href: "/error-test-page",
                    },
                    {
                        label: t("pageTitles.home") + " (old)",
                        href: `/${router.locale}/old-index`,
                        native: true,
                    },
                ]}
            >
                <LanguageSwitcher />
                {authElements}
            </NavBar>
            <Container>{children}</Container>
        </>
    );
}
