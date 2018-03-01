import React from 'react';
import PropTypes from 'prop-types';
import {withFormik} from 'formik';
import Yup from 'yup';


import Input from 'components/inputs/Input';
import {gettext} from 'utils/i18n';
import {getFormPropTypes} from 'utils/types';

const Login = (
    {values, touched, errors, status, isSubmitting, handleChange, handleBlur, handleSubmit},
) => (
    <form onSubmit={handleSubmit}>
        {status !== undefined ?
            <div className="alert alert-danger" role="alert">
                {status}
            </div> : null
        }
        <Input
            id="email"
            name="email"
            placeholder="Enter email"
            label="Email"
            type="text"
            value={values.email}
            touched={touched.email}
            error={errors.email}
            onChange={handleChange}
            onBlur={handleBlur}
        />
        <Input
            id="password"
            name="password"
            placeholder="Password"
            label="Password"
            type="password"
            value={values.password}
            touched={touched.password}
            error={errors.password}
            onChange={handleChange}
            onBlur={handleBlur}
        />

        <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-lg btn-block btn-success"
        >
            {gettext('Log in')}
        </button>
    </form>
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
        email: Yup.string().email(gettext('Invalid email address')),
        password: Yup.string(),
    }),

    handleSubmit: (values, {props, setErrors, setSubmitting, setStatus}) => (
        props.onLogin(values, setErrors, setSubmitting, setStatus)
    ),

    displayName: 'LoginForm', // helps with React DevTools
})(Login);


LoginForm.propTypes = {
    onLogin: PropTypes.func.isRequired,
};


export default LoginForm;
