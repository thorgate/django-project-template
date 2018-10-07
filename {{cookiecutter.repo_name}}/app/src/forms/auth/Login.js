import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Alert } from 'reactstrap';
import { Link } from 'react-router-dom';
import { withFormik, Form } from 'formik';
import * as Yup from 'yup';

import { urlResolve } from 'configuration/routes';
import FormField from 'forms/fields/FormField';
import { gettext, pgettext } from 'utils/i18n';
import { getFormPropTypes } from 'utils/types';


const Login = ({ status, isSubmitting }) => (
    <Form>
        <FormField
            id="email"
            name="email"
            type="text"
            label={gettext('Email')}
            placeholder={gettext('Enter email')}
            disabled={isSubmitting}
            labelSize={4}
        />
        <FormField
            id="password"
            name="password"
            type="password"
            label={gettext('Password')}
            placeholder={gettext('Password')}
            disabled={isSubmitting}
            labelSize={4}
        />

        {status !== undefined
            ? (
                <Alert color={status.color}>
                    {status.message}
                </Alert>
            ) : null
        }

        <Row>
            <Col sm={12} md={4} className="mt-3 ml-auto mr-auto">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-lg btn-block btn-success"
                >
                    {pgettext('login', 'Log in')}
                </button>
            </Col>
        </Row>
        <Row>
            <Col sm={4} className="mt-3 ml-auto mr-auto">
                <Link to={urlResolve('auth:forgot-password')} className="pt-2">
                    {pgettext('login', 'Forgot password?')}
                </Link>
            </Col>
        </Row>
    </Form>
);


Login.propTypes = {
    ...getFormPropTypes(['email', 'password']),
};

const LoginForm = withFormik({
    mapPropsToValues: () => ({
        email: '',
        password: '',
    }),
    validationSchema: Yup.object().shape({
        email: Yup.string().email(pgettext('form error', 'Invalid email address')),
        password: Yup.string(),
    }),

    handleSubmit: (values, { props, setErrors, setSubmitting, setStatus }) => (
        props.onLogin({ payload: values, actions: { setErrors, setSubmitting, setStatus } })
    ),

    displayName: 'LoginForm', // helps with React DevTools
})(Login);


LoginForm.propTypes = {
    onLogin: PropTypes.func.isRequired,
};


export default LoginForm;
