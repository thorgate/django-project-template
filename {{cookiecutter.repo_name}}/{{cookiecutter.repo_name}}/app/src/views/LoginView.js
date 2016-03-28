{% raw %}import React, {Component, PropTypes} from 'react';
import AltIso from 'alt/utils/AltIso';
import {Link} from 'react-router';

import SeoActions from '../actions/SeoActions';
import CurrentUserStore from '../stores/CurrentUserStore';
import LoginForm from '../forms/LoginForm';
import {gettext} from '../i18n';


@AltIso.define(() => {
    return SeoActions.pushTitle(gettext('Log in'));
})
class LoginView extends Component {
    static propTypes = {
        user: PropTypes.object.isRequired
    };

    doLogin(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        const data = this.refs.form.getValue();

        if (data) {
            // Try to log the user in
            CurrentUserStore.login({email: data.email, password: data.password});
        }
    }

    render() {
        return (
            <div className="vertical-wrapper">
                <div className="vertical-inner">
                    <div className="page-login">
                        <div className="brand">
                            <h1>{gettext('{% endraw %}{{ cookiecutter.project_title }}{% raw %}')}</h1>
                        </div>

                        <div className="panel panel-default panel-login">
                            <h2>{gettext('Log in')}</h2>

                            <form className="panel-body" onSubmit={::this.doLogin} noValidate>
                                <LoginForm ref="form" originalFormData={this.props.user.loginError.loginData || {}} loginError={this.props.user.loginError.error} />
                                <button type="submit" className="btn btn-primary">{gettext('LOG IN')}</button>
                            </form>

                            <Link to="home">{gettext('Go back')}</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default LoginView;{% endraw %}
