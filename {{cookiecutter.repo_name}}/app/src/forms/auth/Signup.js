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


const Signup = ({ status, isSubmitting }) => (
    <Form>
        <FormField
            id="name"
            name="name"
            type="text"
            label={gettext('Name')}
            placeholder={gettext('Enter name')}
            disabled={isSubmitting}
            labelSize={4}
        />
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
        <FormField
            id="repeatPassword"
            name="repeatPassword"
            type="password"
            label={gettext('Confirm password')}
            placeholder={gettext('Password confirmation')}
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
                    {pgettext('signup', 'Signup')}
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


Signup.propTypes = {
    ...getFormPropTypes(['email', 'password']),
};

const SignupForm = withFormik({
    mapPropsToValues: () => ({
        name: '',
        email: '',
        password: '',
        repeatPassword: '',
    }),
    validationSchema: Yup.object().shape({
        name: Yup.string()
            .required(pgettext('form error', 'Name is required')),
        email: Yup.string()
            .email(pgettext('form error', 'Invalid email address'))
            .required(pgettext('form error', 'Email is required')),
        password: Yup.string()
            .required(pgettext('form error', 'Password is required')),
        repeatPassword: Yup.string()
            .test('password-match', gettext('Passwords do not match'), function passwordTest(value) {
                const { password } = this.parent;
                return password === value;
            }),
    }),

    handleSubmit: (values, { props, ...formik }) => (
        props.onSignup({ data: values }, formik)
    ),

    displayName: 'SignupForm', // helps with React DevTools
})(Signup);


SignupForm.propTypes = {
    onSignup: PropTypes.func.isRequired,
};


export default SignupForm;
