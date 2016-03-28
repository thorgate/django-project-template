import React, {Component} from 'react';

import {gettext} from '../i18n';


class NotFound extends Component {
    render() {
        return (
            <div>
                <h1>{gettext('Well, well, well...')}</h1>
                <p>{gettext('What don\'t we have here.')}</p>
            </div>
        );
    }
}

export default NotFound;
