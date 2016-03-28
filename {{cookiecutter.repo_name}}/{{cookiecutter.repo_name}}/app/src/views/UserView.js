import React, {Component, PropTypes} from 'react';

import AltIso from 'alt/utils/AltIso';

import SeoActions from '../actions/SeoActions';
import {gettext} from '../i18n';


@AltIso.define(() => {
    return SeoActions.pushTitle(gettext('Users'));
})
class UserView extends Component {
    static propTypes = {
        user: PropTypes.object.isRequired
    };

    render() {
        return (
            <div>
                <h1>{gettext('Users')}</h1>
                <p>
                    {gettext('This is an an authenticated view and the current user is:')} <b>{this.props.user.profile.displayName}</b>
                </p>
            </div>
        );
    }
}

export default UserView;
