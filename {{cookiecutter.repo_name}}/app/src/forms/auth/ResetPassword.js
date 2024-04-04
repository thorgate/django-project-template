import React from "react";
import PropTypes from "prop-types";
import { Trans, useTranslation } from "react-i18next";
import { Row, Col, Alert, Button } from "reactstrap";
import { Link } from "react-router-dom";
import { withFormik, Form } from "formik";
import * as Yup from "yup";
import is from "is_js";
import { resolvePath } from "tg-named-routes";

import FormField from "@/src/forms/fields/FormField";
import { tNoop } from "@/src/utils/text";
import { getFormPropTypes } from "@/src/utils/types";

const ResetPassword = ({ status, isSubmitting }) => {
    const { t } = useTranslation();
    let statusMessage = null;
    let formContent = null;
    if (status && status.success) {
        formContent = (
            <>
                <Row>
                    <Col>
                        <h5>
                            <Trans>
                                Your password has been reset. Try to login with
                                it now.
                            </Trans>
                        </h5>
                    </Col>
                </Row>
                <Row>
                    <Col sm={4} className="my-4">
                        <Link to={resolvePath("auth:login")} className="pt-2">
                            {t("Back to login")}
                        </Link>
                    </Col>
                </Row>
            </>
        );
    } else if (is.object(status)) {
        statusMessage = <Alert color="danger">{status.message}</Alert>;
    }

    if (!(status && status.success)) {
        formContent = (
            <>
                <Row>
                    <Col className="pb-4 text-center">
                        <h5>
                            <Trans>Please enter your new password twice.</Trans>
                        </h5>
                    </Col>
                </Row>

                <FormField
                    id="password"
                    name="password"
                    type="password"
                    label={t("Password")}
                    placeholder={t("Password")}
                    disabled={isSubmitting}
                    labelSize={4}
                />
                <FormField
                    id="password_confirm"
                    name="password_confirm"
                    type="password"
                    label={t("Confirm password")}
                    placeholder={t("Confirm password")}
                    disabled={isSubmitting}
                    labelSize={4}
                />
                <Row>
                    <Col>{statusMessage}</Col>
                </Row>

                <Row>
                    <Col sm={3} className="mt-3 ml-auto mr-auto">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-lg btn-block btn-success"
                        >
                            {t("Confirm")}
                        </Button>
                    </Col>
                </Row>
            </>
        );
    }

    return <Form>{formContent}</Form>;
};

ResetPassword.propTypes = { ...getFormPropTypes(["email", "password"]) };

const ResetPasswordForm = withFormik({
    mapPropsToValues: (props) => ({
        password: "",
        password_confirm: "",
        uid_and_token_b64: props.token,
    }),

    validationSchema: Yup.object().shape({
        password: Yup.string().required(tNoop("Password is required")),
        password_confirm: Yup.string().required(
            tNoop("Password confirmation is required")
        ),
    }),

    handleSubmit: (values, { props, ...formik }) =>
        props.onResetPassword({ data: values }, formik),

    displayName: "ResetPasswordForm", // helps with React DevTools
})(ResetPassword);

ResetPasswordForm.propTypes = {
    token: PropTypes.string.isRequired,
    onResetPassword: PropTypes.func.isRequired,
};

export default ResetPasswordForm;
