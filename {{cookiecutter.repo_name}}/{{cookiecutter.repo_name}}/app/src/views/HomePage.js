{% raw %}import React, {Component, PropTypes} from 'react';

import AltIso from 'alt/utils/AltIso';

import SeoActions from '../actions/SeoActions';
import {gettext, sprintf} from '../i18n';


@AltIso.define(() => {
    return SeoActions.pushTitle(gettext('Home'));
})
class HomePage extends Component {
    static propTypes = {
        user: PropTypes.object.isRequired
    };

    render() {
        const happyMsg = this.props.user.isAuthenticated ?
            sprintf(gettext('Happy coding, %s!'), this.props.user.profile.displayName) : gettext('Happy coding!');

        return (
            <div>
                <h1>{gettext('{% endraw %}{{ cookiecutter.project_title }}{% raw %}')}</h1>
                <p>{gettext('This is the start of a new React project.')} {happyMsg}</p>
            </div>
        );
    }
}

export default HomePage;{% endraw %}
