import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Alert } from 'reactstrap';
import { Link } from 'react-router-dom';
import is from 'is_js';
import { withFormik, Form } from 'formik';
import * as Yup from 'yup';

import { urlResolve } from 'configuration/routes';
import FormField from 'forms/fields/FormField';
import { gettext, pgettext } from 'utils/i18n';
import { getFormPropTypes } from 'utils/types';


const ForgotPassword = ({ values, status, isSubmitting }) => {
    let formContent = (
        <Fragment>
            <Row>
                <Col className="pb-4 text-center">
                    <h5>{gettext('Please enter your email below to receive a password reset link.')}</h5>
                </Col>
            </Row>

            <FormField
                id="email"
                name="email"
                type="text"
                label={gettext('Email')}
                placeholder={gettext('Enter email')}
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
                        {pgettext('forgot password', 'Send link')}
                    </Button>
                </Col>
            </Row>
        </Fragment>
    );

    let statusMessage = null;
    if (status && status.success) {
        formContent = (
            <Fragment>
                <Row>
                    <Col className="pb-4">
                        <h5>{gettext('Reset link sent')}</h5>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <span>{pgettext('forgot password', 'We have sent you an email to ')}</span>
                        <strong>{values.email}</strong>
                        <span>{pgettext('forgot password', ' with a link to reset your password')}</span>
                    </Col>
                </Row>
                <Row>
                    <Col md={5} className="mt-3">
                        <Button
                            tag={Link}
                            to={urlResolve('auth:forgot-password')}
                            className="btn btn-lg btn-block btn-success"
                        >
                            {pgettext('forgot password', 'Resend link')}
                        </Button>
                    </Col>
                </Row>
                <Row>
                    <Col sm={4} className="mt-3">
                        <Link to={urlResolve('auth:login')} className="pt-2">
                            {pgettext('forgot password', 'Back to login')}
                        </Link>
                    </Col>
                </Row>
            </Fragment>
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
            .email(pgettext('form error', 'Invalid email address'))
            .required(pgettext('form error', 'Email address is required')),
    }),

    handleSubmit: (values, { props, ...formik }) => (
        props.onForgotPassword({ data: values }, formik)
    ),

    displayName: 'ForgotPasswordForm', // helps with React DevTools
})(ForgotPassword);


ForgotPasswordForm.propTypes = {
    onForgotPassword: PropTypes.func.isRequired,
};


export default ForgotPasswordForm;
