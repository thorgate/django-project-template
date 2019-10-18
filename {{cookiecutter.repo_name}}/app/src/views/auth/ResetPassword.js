import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import AuthLayout from 'components/layouts/AuthLayout';
import ResetPasswordForm from 'forms/auth/ResetPassword';
import withView from 'decorators/withView';
import { resetPassword } from 'sagas/auth/resetPasswordSaga';
import { RouterMatchShape } from 'utils/types';

const ResetPassword = ({ match, onResetPassword }) => {
    const { t } = useTranslation();
    return (
        <AuthLayout>
            <Helmet title={t('Reset Password')} />
            <ResetPasswordForm
                token={match.params.token}
                onResetPassword={onResetPassword}
            />
        </AuthLayout>
    );
};

ResetPassword.propTypes = {
    match: RouterMatchShape.isRequired,
    onResetPassword: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
    onResetPassword: resetPassword,
};

const ResetPasswordConnector = connect(
    null,
    mapDispatchToProps,
)(ResetPassword);

const ResetPasswordView = withView()(ResetPasswordConnector);

export default ResetPasswordView;
