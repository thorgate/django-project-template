{% raw %}import React, {Component, PropTypes} from 'react';
import {RouteHandler, Link} from 'react-router';

import CurrentUserStore from '../stores/CurrentUserStore';
import ListLink from '../components/ListLink';
import {gettext} from '../i18n';


class BaseTemplate extends Component {
    static propTypes = {
        user: PropTypes.object.isRequired
    };

    onLogout(e) {
        e.preventDefault();

        CurrentUserStore.logout();
    }

    renderUserMenu() {
        if (this.props.user.isAuthenticated) {
            return (
                <li>
                    <a href="logout" onClick={::this.onLogout}>{gettext('Log out')}</a>
                </li>
            );
        }

        else {
            return (
                <li>
                    <Link to="login">{gettext('Log in')}</Link>
                </li>
            );
        }
    }

    render() {
        return (
            <div>
                <header className="navbar navbar-default navbar-static-top">
                    <div className="container">
                        <Link className="navbar-brand" to="/">{gettext('{% endraw %}{{ cookiecutter.project_title }}{% raw %}')}</Link>

                        <ul className="nav navbar-nav navbar-right">
                             <ListLink to="users">{gettext('Users')}</ListLink>

                            {this.renderUserMenu()}
                        </ul>
                    </div>
                </header>

                <div className="container">
                    <RouteHandler {...this.props} />
                </div>
            </div>
        );
    }
}


export default BaseTemplate;{% endraw %}
