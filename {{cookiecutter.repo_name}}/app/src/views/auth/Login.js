import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';

import AuthLayout from 'components/layouts/AuthLayout';
import LoginForm from 'forms/auth/Login';
import withView from 'decorators/withView';
import { obtainToken } from 'sagas/auth/obtainTokenSaga';
import { pgettext } from 'utils/i18n';


const Login = ({ onLogin }) => (
    <AuthLayout>
        <Helmet>
            <title>{pgettext('view', 'Login')}</title>
        </Helmet>
        <LoginForm onLogin={onLogin} />
    </AuthLayout>
);

Login.propTypes = {
    onLogin: PropTypes.func.isRequired,
};


const mapDispatchToProps = (dispatch) => ({
    onLogin: (payload, actions) => (
        dispatch(obtainToken(payload, actions))
    ),
});


const LoginConnector = connect(
    null,
    mapDispatchToProps,
)(Login);

const LoginAsView = withView()(LoginConnector);

export default LoginAsView;
