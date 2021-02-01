import { getUser, isAuthenticated } from '@thorgate/spa-permissions';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Nav, Navbar, NavbarBrand, NavItem, NavLink } from 'reactstrap';
import { resolvePath } from 'tg-named-routes';

import { SETTINGS } from 'settings';
import { UserShape } from 'utils/types';

const NavigationBar = ({ user, isLoggedIn }) => {
    const { t } = useTranslation();

    let authNav = (
        <Nav className="ml-auto" navbar>
            <NavItem>
                <NavLink tag={Link} to={resolvePath('auth:signup')}>
                    {t('Signup')}
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink tag={Link} to={resolvePath('auth:login')}>
                    {t('Login')}
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
                    <NavLink tag={Link} to={resolvePath('auth:logout')}>
                        {t('Logout')}
                    </NavLink>
                </NavItem>
            </Nav>
        );
    }

    let devUrls = null;
    if (process.env.NODE_ENV !== 'production') {
        devUrls = (
            <NavItem>
                <NavLink
                    href={SETTINGS.SITE_URL + SETTINGS.DJANGO_ADMIN_PANEL}
                    target="_blank"
                >
                    {t('Admin panel')}
                </NavLink>
            </NavItem>
        );
    }

    return (
        <Navbar color="faded" light expand="md">
            <NavbarBrand tag={Link} to={resolvePath('landing')}>
                HOME
            </NavbarBrand>
            <Nav navbar>
                <NavItem>
                    <NavLink tag={Link} to={resolvePath('restricted')}>
                        {t('Restricted view')}
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
