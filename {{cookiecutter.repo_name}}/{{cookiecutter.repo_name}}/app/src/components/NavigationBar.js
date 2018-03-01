import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Link, withRouter} from 'react-router-dom';
import {Nav, Navbar, NavbarBrand, NavItem, NavLink} from 'reactstrap';

import {urlResolve} from 'configuration/routes';
import {selectors as userSelectors} from 'ducks/user';
import {logout} from 'sagas/user/logoutSaga';
import {gettext} from 'utils/i18n';
import {UserShape} from 'utils/types';


const NavigationBar = ({user, isAuthenticated, onLogout}) => {
    let authNav = (
        <Nav className="ml-auto" navbar>
            <NavItem>
                <NavLink tag={Link} to={urlResolve('login')}>{gettext('Login')}</NavLink>
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
                    <NavLink href="#" onClick={onLogout}>
                        {gettext('Logout')}
                    </NavLink>
                </NavItem>
            </Nav>
        );
    }

    return (
        <Navbar color="faded" light expand="md">
            <NavbarBrand tag={Link} to={urlResolve('landing')}>HOME</NavbarBrand>
            {authNav}
        </Navbar>
    );
};

NavigationBar.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    onLogout: PropTypes.func.isRequired,
    user: UserShape,
};

NavigationBar.defaultProps = {
    user: null,
};


const mapStateToProps = state => ({
    user: userSelectors.user(state),
    activeLanguage: userSelectors.activeLanguage(state),
    isAuthenticated: userSelectors.isAuthenticated(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onLogout: () => dispatch(logout(ownProps.location.pathname)),
});

const NavigationBarConnector = connect(
    mapStateToProps,
    mapDispatchToProps,
)(NavigationBar);


export default withRouter(NavigationBarConnector);
