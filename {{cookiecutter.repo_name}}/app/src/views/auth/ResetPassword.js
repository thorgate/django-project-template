import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import AuthLayout from 'components/layouts/AuthLayout';
import ResetPasswordForm from 'forms/auth/ResetPassword';
import withView from 'decorators/withView';
import { resetPassword } from 'sagas/auth/resetPasswordSaga';
import { pgettext } from 'utils/i18n';
import { RouterMatchShape } from 'utils/types';


const ResetPassword = ({ match, onResetPassword }) => (
    <AuthLayout>
        <Helmet title={pgettext('view', 'Reset Password')} />
        <ResetPasswordForm
            token={match.params.token}
            onResetPassword={onResetPassword}
        />
    </AuthLayout>
);

ResetPassword.propTypes = {
    match: RouterMatchShape.isRequired,
    onResetPassword: PropTypes.func.isRequired,
};


const mapDispatchToProps = (dispatch) => ({
    onResetPassword: (payload) => (
        dispatch(resetPassword(payload))
    ),
});

const ResetPasswordConnector = connect(
    null,
    mapDispatchToProps,
)(ResetPassword);

const ResetPasswordView = withView()(ResetPasswordConnector);

export default ResetPasswordView;
