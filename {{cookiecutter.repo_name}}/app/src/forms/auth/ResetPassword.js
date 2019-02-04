import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Alert } from 'reactstrap';
import { Link } from 'react-router-dom';
import { withFormik, Form } from 'formik';
import * as Yup from 'yup';
import is from 'is_js';

import { urlResolve } from 'configuration/routes';
import FormField from 'forms/fields/FormField';
import { gettext, pgettext } from 'utils/i18n';
import { getFormPropTypes } from 'utils/types';


const ResetPassword = ({ status, isSubmitting }) => {
    let statusMessage = null;
    let formContent = null;
    if (status && status.success) {
        formContent = (
            <Fragment>
                <Row>
                    <Col>
                        <h5>{gettext('Your password has been reset. Try to login with it now.')}</h5>
                    </Col>
                </Row>
                <Row>
                    <Col sm={4} className="my-4">
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

    if (!(status && status.success)) {
        formContent = (
            <Fragment>
                <Row>
                    <Col className="pb-4 text-center">
                        <h5>{gettext('Please enter your new password twice.')}</h5>
                    </Col>
                </Row>

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
                    id="password_confirm"
                    name="password_confirm"
                    type="password"
                    label={gettext('Confirm password')}
                    placeholder={gettext('Confirm password')}
                    disabled={isSubmitting}
                    labelSize={4}
                />
                <Row>
                    <Col>
                        {statusMessage}
                    </Col>
                </Row>

                <Row>
                    <Col sm={3} className="mt-3 ml-auto mr-auto">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-lg btn-block btn-success"
                        >
                            {pgettext('reset password', 'Confirm')}
                        </button>
                    </Col>
                </Row>
            </Fragment>
        );
    }

    return (
        <Form>
            {formContent}
        </Form>
    );
};


ResetPassword.propTypes = { ...getFormPropTypes(['email', 'password']) };


const ResetPasswordForm = withFormik({
    mapPropsToValues: (props) => ({
        password: '',
        password_confirm: '',
        uid_and_token_b64: props.token,
    }),

    validationSchema: Yup.object().shape({
        password: Yup.string().required(pgettext('form error', 'Password is required')),
        password_confirm: Yup.string().required(pgettext('form error', 'Password confirmation is required')),
    }),

    handleSubmit: (values, { props, ...formik }) => (
        props.onResetPassword({ data: values }, formik)
    ),

    displayName: 'ResetPasswordForm', // helps with React DevTools
})(ResetPassword);


ResetPasswordForm.propTypes = {
    token: PropTypes.string.isRequired,
    onResetPassword: PropTypes.func.isRequired,
};


export default ResetPasswordForm;
