import React from "react";
import { useTranslation } from "next-i18next";
import { ToastContainer } from "react-toastify";

import { Container } from "./Container";
import { NavBar } from "./NavBar";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useUserMeRetrieveQuery } from "@lib/queries";
import config from "@lib/config";

interface LayoutProps {
    children: React.ReactNode;

    authElements?: React.ReactNode;
}

export function Layout({ children, authElements }: LayoutProps) {
    const { t } = useTranslation("common");
    const { data: userData } = useUserMeRetrieveQuery();

    const navItems = React.useMemo(
        () => [
            {
                label: t("pageTitles.home"),
                href: "/",
            },
            {
                label: t("pageTitles.userList"),
                href: "/users",
            },
            {
                label: t("pageTitles.about"),
                href: "/about",
            },
            {
                label: t("pageTitles.errorTestPage"),
                href: "/error-test-page",
            },
            ...(userData?.isStaff
                ? [
                      {
                          label: t("pageTitles.admin"),
                          href: `${config("BACKEND_SITE_URL")}/adminpanel`,
                      },
                      {
                          label: t("pageTitles.apiDocumentation"),
                          href: `${config(
                              "BACKEND_SITE_URL"
                          )}/api/schema/swagger-ui`,
                      },
                  ]
                : []),
        ],
        [userData?.isStaff, t]
    );

    return (
        <>
            <NavBar navItems={navItems}>
                <LanguageSwitcher />
                {authElements}
            </NavBar>
            <Container>{children}</Container>
            <ToastContainer />
        </>
    );
}
