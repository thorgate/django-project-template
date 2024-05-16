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
    const { t } = useTranslation(["common"]);

    return (
        <>
            <NavBar
                navItems={[
                    {
                        label: t("common:pageTitles.home"),
                        href: "/new-index",
                    },
                    {
                        label: t("common:pageTitles.user-details"),
                        href: "/user-details",
                    },
                    {
                        label: t("common:pageTitles.about"),
                        href: "/about",
                    },
                    {
                        label: t("common:pageTitles.errorTestPage"),
                        href: "/error-test-page",
                    },
                    {
                        label: t("common:pageTitles.home") + " (old)",
                        href: `/${router.locale}/`,
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
