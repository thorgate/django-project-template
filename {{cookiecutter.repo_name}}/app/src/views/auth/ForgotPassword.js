import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';

import AuthLayout from 'components/layouts/AuthLayout';
import ForgotPasswordForm from 'forms/auth/ForgotPassword';
import withView from 'decorators/withView';
import { forgotPassword } from 'sagas/auth/forgotPasswordSaga';
import { pgettext } from 'utils/i18n';


const ForgotPassword = ({ onForgotPassword }) => (
    <AuthLayout>
        <Helmet title={pgettext('view', 'Forgot Password')} />
        <ForgotPasswordForm onForgotPassword={onForgotPassword} />
    </AuthLayout>
);

ForgotPassword.propTypes = {
    onForgotPassword: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
    onForgotPassword: (payload, actions) => (
        dispatch(forgotPassword(payload, actions))
    ),
});

const ForgotPasswordConnector = connect(
    null,
    mapDispatchToProps,
)(ForgotPassword);

const ForgotPasswordView = withView()(ForgotPasswordConnector);

export default ForgotPasswordView;
