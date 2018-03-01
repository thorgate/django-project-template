import Raven from 'raven-js';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import PageError from 'components/PageError';
import {urlResolve} from 'configuration/routes';
import {gettext, pgettext, nl2br} from 'utils/i18n';


class ErrorBoundary extends Component {
    static propTypes = {
        error: PropTypes.shape({
            statusCode: PropTypes.number,
            responseText: PropTypes.string,
            stack: PropTypes.any,
        }),
        children: PropTypes.node,
    };

    static defaultProps = {
        error: null,
        children: null,
    };

    state = {
        error: null,
        errorInfo: null,
    };

    componentDidCatch(error, errorInfo) {
        // Catch errors in any components below and re-render with error message
        this.setState({error, errorInfo});
        if (!DEV_MODE) {
            Raven.captureException(error);
        }
    }

    pageReload = () => {
        document.location.reload();
    };

    renderStatusCode = (error) => {
        try {
            const jsonErr = JSON.parse(error.responseText);

            if (jsonErr && jsonErr.sentry) {
                return [gettext('Fault code: #'), jsonErr.sentry];
            }
        } catch (e) { // eslint-disable-line
        }

        return [gettext('Status code: '), error.statusCode || 500];
    };

    renderPageError = (error, details) => {
        const title = gettext('Something went wrong');
        const description = nl2br(gettext('Something went wrong on our side... \n Please hold on while we fix it.'));
        return (
            <PageError title={title} description={description} wide>
                <p className="text-muted">{this.renderStatusCode(error)}</p>

                <button className="btn btn-default" onClick={this.pageReload}>{gettext('Reload page')}</button>
                &nbsp;{pgettext('link divider', 'or')}&nbsp;
                <Link to={`${urlResolve('landing')}`}>{gettext('go to homepage')}</Link>
                {details}
            </PageError>
        );
    };

    renderPageFault = () => {
        const {error} = this.props;

        let details = null;
        if (DEV_MODE) {
            console.error('PageFault', error.toString(), '-', error); // eslint-disable-line
            details = <pre>{error.responseText || `${error.stack}`}</pre>;
        }

        return this.renderPageError(error, details);
    };

    renderComponentError = () => {
        const {error, errorInfo} = this.state;

        let details = null;
        if (DEV_MODE) {
            console.error('ComponentError', error, '-', error && error.stack); // eslint-disable-line
            details = (
                <pre>
                    {error && error.toString()}
                    <br />
                    {errorInfo.componentStack}
                </pre>
            );
        }

        return this.renderPageError(error, details);
    };

    render() {
        const {error, children} = this.props;
        const {errorInfo} = this.state;

        if (error) {
            return this.renderPageFault();
        }

        if (errorInfo) {
            return this.renderComponentError();
        }

        return children;
    }
}


export default ErrorBoundary;
