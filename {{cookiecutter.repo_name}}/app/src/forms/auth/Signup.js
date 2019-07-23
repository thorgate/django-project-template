import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Row, Col, Alert, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { withFormik, Form } from 'formik';
import * as Yup from 'yup';
import { resolvePath as urlResolve } from 'tg-named-routes';

import FormField from 'forms/fields/FormField';
import { tNoop } from 'utils/text';
import { getFormPropTypes } from 'utils/types';


const Signup = ({ status, isSubmitting }) => {
    const { t } = useTranslation();
    return (
        <Form>
            <FormField
                id="name"
                name="name"
                type="text"
                label={t('Name')}
                placeholder={t('Enter name')}
                disabled={isSubmitting}
                labelSize={4}
            />
            <FormField
                id="email"
                name="email"
                type="text"
                label={t('Email')}
                placeholder={t('Enter email')}
                disabled={isSubmitting}
                labelSize={4}
            />
            <FormField
                id="password"
                name="password"
                type="password"
                label={t('Password')}
                placeholder={t('Password')}
                disabled={isSubmitting}
                labelSize={4}
            />
            <FormField
                id="repeatPassword"
                name="repeatPassword"
                type="password"
                label={t('Confirm password')}
                placeholder={t('Password confirmation')}
                disabled={isSubmitting}
                labelSize={4}
            />

            {status !== undefined && (
                <Alert color={status.color === undefined ? 'danger' : status.color}>
                    {status.message}
                </Alert>
            )}

            <Row>
                <Col sm={12} md={4} className="mt-3 ml-auto mr-auto">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-lg btn-block btn-success"
                    >
                        {t('Signup')}
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col sm={4} className="mt-3 ml-auto mr-auto">
                    <Link to={urlResolve('auth:forgot-password')} className="pt-2">
                        {t('Forgot password?')}
                    </Link>
                </Col>
            </Row>
        </Form>
    );
};


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
            .required(tNoop('Name is required')),
        email: Yup.string()
            .email(tNoop('Invalid email address'))
            .required(tNoop('Email is required')),
        password: Yup.string()
            .required(tNoop('Password is required')),
        repeatPassword: Yup.string()
            .test(
                'password-match',
                tNoop('Passwords do not match'),
                function passwordTest(value) {
                    const { password } = this.parent;
                    return password === value;
                },
            ),
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
