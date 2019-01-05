import { ConnectedRedirect } from '@thorgate/spa-pending-data';
import React from 'react';
import PropTypes from 'prop-types';
import qs from 'qs';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import AuthLayout from 'components/layouts/AuthLayout';
import { urlResolve } from 'configuration/routes';
import LoginForm from 'forms/auth/Login';
import withView from 'decorators/withView';
import { obtainToken } from 'sagas/auth/obtainTokenSaga';
import { pgettext } from 'utils/i18n';
import { RouterLocationShape } from 'utils/types';


const Login = ({ location, isAuthenticated, onLogin }) => {
    const query = qs.parse(location.search, { ignoreQueryPrefix: true });
    const { permissionDenied } = location.state || {};

    if (isAuthenticated && !permissionDenied) {
        let nextUrl = '/';
        if (query.next && query.next !== urlResolve('auth:login')) {
            nextUrl = query.next;
        }

        return (
            <ConnectedRedirect to={nextUrl} />
        );
    }

    return (
        <AuthLayout>
            <Helmet>
                <title>{pgettext('view', 'Login')}</title>
            </Helmet>
            <LoginForm onLogin={onLogin} />
        </AuthLayout>
    );
};

Login.propTypes = {
    onLogin: PropTypes.func.isRequired,
    location: RouterLocationShape.isRequired,
    isAuthenticated: PropTypes.bool,
};

Login.defaultProps = {
    isAuthenticated: false,
};


const mapDispatchToProps = (dispatch) => ({
    onLogin: (payload) => (
        dispatch(obtainToken(payload))
    ),
});


const LoginConnector = connect(
    null,
    mapDispatchToProps,
)(Login);

const LoginAsView = withView()(LoginConnector);

export default LoginAsView;
