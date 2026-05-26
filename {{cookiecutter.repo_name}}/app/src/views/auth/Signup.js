import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import AuthLayout from "@/src/components/layouts/AuthLayout";
import SignupForm from "@/src/forms/auth/Signup";
import withView from "@/src/decorators/withView";
import { signup } from "@/src/sagas/auth/signupSaga";
import { RouterLocationShape } from "@/src/utils/types";

const Signup = ({ onSignup }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "loading") {
            // Do nothing while loading
            return;
        }

        if (status === "authenticated") {
            window.location.href = router.query.next || "/";
        }
    }, [status, router]);

    return (
        <AuthLayout>
            <Helmet>
                <title>{t("Signup")}</title>
            </Helmet>
            <SignupForm onSignup={onSignup} />
        </AuthLayout>
    );
};

Signup.propTypes = {
    onSignup: PropTypes.func.isRequired,
    location: RouterLocationShape.isRequired,
    isAuthenticated: PropTypes.bool,
};

Signup.defaultProps = {
    isAuthenticated: false,
};

const mapDispatchToProps = {
    onSignup: signup,
};

export default withView()(connect(null, mapDispatchToProps)(Signup));
