import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import AuthLayout from 'components/layouts/AuthLayout';
import ForgotPasswordForm from 'forms/auth/ForgotPassword';
import withView from 'decorators/withView';
import { forgotPassword } from 'sagas/auth/forgotPasswordSaga';

const ForgotPassword = ({ onForgotPassword }) => {
    const { t } = useTranslation();
    return (
        <AuthLayout>
            <Helmet title={t('Forgot Password')} />
            <ForgotPasswordForm onForgotPassword={onForgotPassword} />
        </AuthLayout>
    );
};

ForgotPassword.propTypes = {
    onForgotPassword: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
    onForgotPassword: forgotPassword,
};

const ForgotPasswordConnector = connect(
    null,
    mapDispatchToProps,
)(ForgotPassword);

const ForgotPasswordView = withView()(ForgotPasswordConnector);

export default ForgotPasswordView;
