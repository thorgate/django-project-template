{% raw %}import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';

import {gettext, pgettext} from '../i18n';
import MessagePanel from '../components/MessagePanel';
import {nl2br} from '../utils/text';


class PageError extends Component {
    static propTypes = {
        pageFault: PropTypes.any.isRequired
    };

    renderStatusCode() {
        try {
            const jsonErr = JSON.parse(this.props.pageFault.responseText);

            if (jsonErr && jsonErr.sentry) {
                return [
                    gettext('Fault code: #'),
                    jsonErr.sentry
                ];
            }
        } catch (e) {}  // eslint-disable-line

        return [
            gettext('Status code: '),
            this.props.pageFault.statusCode
        ];
    }
    render() {
        let details = null;
        if (process.env.NODE_ENV !== 'production') {
            console.error('PageFault', this.props.pageFault, '-', this.props.pageFault.stack);
            details = <pre>{this.props.pageFault.responseText || this.props.pageFault}</pre>;
        }

        const title = gettext('Something went wrong');
        const description = nl2br(gettext('Something went wrong on our side... \n Please hold on while we fix it.'));
        return (
            <MessagePanel title={title} description={description}>
                <p className="text-muted">{this.renderStatusCode()}</p>

                <a href="javascript: document.location.reload();">{gettext('Reload page')}</a>
                &nbsp;{pgettext('link divider', 'or')}&nbsp;
                <Link to="home">{gettext('go to homepage')}</Link>
                {details}
            </MessagePanel>
        );
    }
}

export default PageError;{% endraw %}
