import { getUser, isAuthenticated } from '@thorgate/spa-permissions';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Nav, Navbar, NavbarBrand, NavItem, NavLink } from 'reactstrap';

import { urlResolve } from 'configuration/routes';
import { selectors as appSelectors } from 'ducks/application';
import SETTINGS from 'settings';
import { gettext } from 'utils/i18n';
import { UserShape } from 'utils/types';


const NavigationBar = ({ user, isAuthenticated }) => {
    let authNav = (
        <Nav className="ml-auto" navbar>
            <NavItem>
                <NavLink tag={Link} to={urlResolve('auth:signup')}>{gettext('Signup')}</NavLink>
            </NavItem>
            <NavItem>
                <NavLink tag={Link} to={urlResolve('auth:login')}>{gettext('Login')}</NavLink>
            </NavItem>
        </Nav>
    );

    if (isAuthenticated) {
        authNav = (
            <Nav className="ml-auto" navbar>
                <NavItem>
                    <NavLink href="#">{user.email}</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to={urlResolve('auth:logout')}>{gettext('Logout')}</NavLink>
                </NavItem>
            </Nav>
        );
    }

    let devUrls = null;
    if (process.env.NODE_ENV !== 'production') {
        devUrls = (
            <NavItem>
                <NavLink href={SETTINGS.SITE_URL + SETTINGS.DJANGO_ADMIN_PANEL} target="_blank">
                    {gettext('Admin panel')}
                </NavLink>
            </NavItem>
        );
    }

    return (
        <Navbar color="faded" light expand="md">
            <NavbarBrand tag={Link} to={urlResolve('landing')}>HOME</NavbarBrand>
            <Nav navbar>
                <NavItem>
                    <NavLink tag={Link} to={urlResolve('restricted')}>{gettext('Restricted view')}</NavLink>
                </NavItem>
                {devUrls}
            </Nav>
            {authNav}
        </Navbar>
    );
};

NavigationBar.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    user: UserShape,
};

NavigationBar.defaultProps = {
    user: null,
};


const mapStateToProps = (state) => ({
    user: getUser(state),
    activeLanguage: appSelectors.activeLanguage(state),
    isAuthenticated: isAuthenticated(state),
});

const NavigationBarConnector = connect(
    mapStateToProps,
)(NavigationBar);


export default withRouter(NavigationBarConnector);
