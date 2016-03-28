import React, {Component, PropTypes} from 'react';

import {gettext} from '../i18n';


class ProblemView extends Component {
    static propTypes = {
        problem: PropTypes.string.isRequired
    };

    render() {
        // TODO: Provide a nice problem page
        return (
            <div className="alert alert-info">
                <strong>{gettext('Oh snap!')}</strong>
                <div>
                    {this.props.problem}
                </div>
            </div>
        );
    }
}

export default ProblemView;
