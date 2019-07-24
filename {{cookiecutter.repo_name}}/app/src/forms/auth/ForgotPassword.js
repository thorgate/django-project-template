{% raw %}import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Alert } from 'reactstrap';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import is from 'is_js';
import { withFormik, Form } from 'formik';
import * as Yup from 'yup';
import { resolvePath as urlResolve } from 'tg-named-routes';

import FormField from 'forms/fields/FormField';
import { tNoop } from 'utils/text';
import { getFormPropTypes } from 'utils/types';


const ForgotPassword = ({ values, status, isSubmitting }) => {
    const { t } = useTranslation();

    let formContent = (
        <>
            <Row>
                <Col className="pb-4 text-center">
                    <h5>
                        <Trans>
                            Please enter your email below to receive a password reset link.
                        </Trans>
                    </h5>
                </Col>
            </Row>

            <FormField
                id="email"
                name="email"
                type="text"
                label={t('Email')}
                placeholder={t('Enter email')}
                disabled={isSubmitting}
                labelSize={3}
            />

            <Row>
                <Col md={5} className="mt-3 ml-auto mr-auto">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-lg btn-block btn-success"
                    >
                        {t('Send link')}
                    </Button>
                </Col>
            </Row>
        </>
    );

    const { email } = values;

    let statusMessage = null;
    if (status && status.success) {
        formContent = (
            <>
                <Row>
                    <Col className="pb-4">
                        <h5>{t('Reset link sent')}</h5>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Trans>
                            We have sent you an email to <strong>{{ email }}</strong>  with a link to reset your password
                        </Trans>
                    </Col>
                </Row>
                <Row>
                    <Col md={5} className="mt-3">
                        <Button
                            tag={Link}
                            to={urlResolve('auth:forgot-password')}
                            className="btn btn-lg btn-block btn-success"
                        >
                            {t('Resend link')}
                        </Button>
                    </Col>
                </Row>
                <Row>
                    <Col sm={4} className="mt-3">
                        <Link to={urlResolve('auth:login')} className="pt-2">
                            {t('Back to login')}
                        </Link>
                    </Col>
                </Row>
            </>
        );
    } else if (is.object(status)) {
        statusMessage = (
            <Alert color="danger">
                {status.message}
            </Alert>
        );
    }

    return (
        <Form>
            {statusMessage}
            {formContent}
        </Form>
    );
};


ForgotPassword.propTypes = { ...getFormPropTypes(['email', 'password']) };


const ForgotPasswordForm = withFormik({
    mapPropsToValues: () => ({
        email: '',
    }),

    validationSchema: Yup.object().shape({
        email: Yup.string()
            .email(tNoop('Invalid email address'))
            .required(tNoop('Email address is required')),
    }),

    handleSubmit: (values, { props, ...formik }) => (
        props.onForgotPassword({ data: values }, formik)
    ),

    displayName: 'ForgotPasswordForm', // helps with React DevTools
})(ForgotPassword);


ForgotPasswordForm.propTypes = {
    onForgotPassword: PropTypes.func.isRequired,
};


export default ForgotPasswordForm;{% endraw %}
