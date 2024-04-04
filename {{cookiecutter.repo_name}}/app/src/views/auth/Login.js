import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet-async";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";

import AuthLayout from "@/src/components/layouts/AuthLayout";
import LoginForm from "@/src/forms/auth/Login";
import withView from "@/src/decorators/withView";
import { obtainToken } from "@/src/sagas/auth/obtainTokenSaga";

const Login = ({ onLogin }) => {
    const { t } = useTranslation();
    return (
        <AuthLayout>
            <Helmet>
                <title>{t("Login")}</title>
            </Helmet>
            <LoginForm onLogin={onLogin} />
        </AuthLayout>
    );
};

Login.propTypes = {
    onLogin: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
    onLogin: obtainToken,
};

const LoginConnector = connect(null, mapDispatchToProps)(Login);

const LoginAsView = withView()(LoginConnector);

export default LoginAsView;
