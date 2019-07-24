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


const Login = ({ status, isSubmitting }) => {
    const { t } = useTranslation();
    return (
        <Form>
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
                        {t('Log in')}
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


Login.propTypes = {
    ...getFormPropTypes(['email', 'password']),
};

const LoginForm = withFormik({
    mapPropsToValues: () => ({
        email: '',
        password: '',
    }),
    validationSchema: Yup.object().shape({
        email: Yup.string().email(tNoop('Invalid email address')),
        password: Yup.string(),
    }),

    handleSubmit: (values, { props, ...formik }) => (
        props.onLogin({ data: values }, formik)
    ),

    displayName: 'LoginForm', // helps with React DevTools
})(Login);


LoginForm.propTypes = {
    onLogin: PropTypes.func.isRequired,
};


export default LoginForm;
