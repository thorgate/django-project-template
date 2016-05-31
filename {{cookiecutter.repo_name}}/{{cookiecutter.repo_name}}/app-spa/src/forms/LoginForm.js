import React, {Component, PropTypes} from 'react';
import t from 'tcomb-form';

import validators from './validators/index';
import {ValidatonError} from '../resources/GenericResource';


const LoginFormModel = t.struct({
    email: validators.email,
    password: t.Str
});


class LoginForm extends Component {
    static propTypes = {
        originalFormData: PropTypes.object.isRequired,
        loginError: PropTypes.instanceOf(ValidatonError)
    };

    constructor(props) {
        super(props);
    }

    getValue() {
        return this.refs.form.getValue();
    }

    getOptions() {
        var loginError = this.props.loginError;

        return {
            auto: 'placeholders',
            hasError: !!loginError,
            fields: {
                email: {
                    hasError: !!loginError,
                    error: loginError && loginError.getFieldError && loginError.getFieldError('email', true) || null
                },

                password: {
                    type: 'password'
                }
            }
        };
    }

    render() {
        return (
            <t.form.Form ref="form" value={this.props.originalFormData} type={LoginFormModel} options={this.getOptions()} />
        );
    }
}

export default LoginForm;
