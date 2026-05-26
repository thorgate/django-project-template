import { getUser, isAuthenticated } from "@thorgate/spa-permissions";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { Nav, Navbar, NavbarBrand, NavItem, NavLink } from "reactstrap";
import { useI18nResolvePath } from "tg-i18n-named-routes";

import { SETTINGS } from "@/src/settings";
import { UserShape } from "@/src/utils/types";

const NavigationBar = ({ user, isLoggedIn }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const resolvePath = useI18nResolvePath();

    let authNav = (
        <Nav className="ml-auto" navbar>
            <NavItem>
                <NavLink tag={Link} to={resolvePath("auth:signup")}>
                    {t("Signup")}
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink tag={"a"} href="/auth/login">
                    {t("Login")}
                </NavLink>
            </NavItem>
        </Nav>
    );

    if (isLoggedIn) {
        authNav = (
            <Nav className="ml-auto" navbar>
                <NavItem>
                    <NavLink href="#">{user.email}</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        tag={"a"}
                        onClick={async () => {
                            await signOut({ redirect: false });
                            router.reload();
                        }}
                    >
                        {t("Logout")}
                    </NavLink>
                </NavItem>
            </Nav>
        );
    }

    let devUrls = null;
    if (process.env.NODE_ENV !== "production") {
        devUrls = (
            <NavItem>
                <NavLink
                    href={
                        SETTINGS.BACKEND_SITE_URL + SETTINGS.DJANGO_ADMIN_PANEL
                    }
                    target="_blank"
                >
                    {t("Admin panel")}
                </NavLink>
            </NavItem>
        );
    }

    return (
        <Navbar color="faded" light expand="md">
            <NavbarBrand tag={Link} to={resolvePath("landing")}>
                HOME
            </NavbarBrand>
            <Nav navbar>
                <NavItem>
                    <NavLink tag={Link} to={resolvePath("restricted")}>
                        {t("Restricted view")}
                    </NavLink>
                </NavItem>
                {devUrls}
            </Nav>
            {authNav}
        </Navbar>
    );
};

NavigationBar.propTypes = {
    isLoggedIn: PropTypes.bool.isRequired,
    user: UserShape,
};

NavigationBar.defaultProps = {
    user: null,
};

const mapStateToProps = (state) => ({
    user: getUser(state),
    isLoggedIn: isAuthenticated(state),
});

const NavigationBarConnector = connect(mapStateToProps)(NavigationBar);

export default withRouter(NavigationBarConnector);
