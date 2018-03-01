{% raw %}import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Raven from 'raven-js';
import Helmet from 'react-helmet';
import {connect} from 'react-redux';
import {withRouter, Redirect} from 'react-router';

import NotFound from 'components/NotFound';
import ErrorBoundary from 'containers/ErrorBoundary';

import {selectors as authSelectors} from 'ducks/user';

import {RouterLocationShape, ErrorShape, UserShape} from 'utils/types';
import {windowPageOffset, windowScroll, sessionStorageGetItem, sessionStorageSetItem} from 'utils/window';


const mapStateToProps = state => ({
    error: state.errors,
    isAuthenticated: authSelectors.isAuthenticated(state),
    user: authSelectors.user(state),
    activeLanguage: authSelectors.activeLanguage(state),
});

@withRouter
@connect(mapStateToProps)
class View extends Component {
    static propTypes = {
        location: RouterLocationShape.isRequired,
        isAuthenticated: PropTypes.bool.isRequired,

        // optional props
        user: UserShape,
        title: PropTypes.string,
        className: PropTypes.string,
        activeLanguage: PropTypes.string,
        authRequired: PropTypes.bool,
        error: ErrorShape,
        children: PropTypes.node,
        NotFoundComponent: PropTypes.func,
    };

    static defaultProps = {
        user: {},
        children: null,
        title: '',
        className: '',
        activeLanguage: '',
        error: null,
        authRequired: false,
        NotFoundComponent: NotFound,
    };

    static setPageOffset(key, x, y) {
        sessionStorageSetItem(`Page.scrollPositions.${key}.x`, x);
        sessionStorageSetItem(`Page.scrollPositions.${key}.y`, y);
    }

    static getPageOffset(key) {
        const x = sessionStorageGetItem(`Page.scrollPositions.${key}.x`);
        const y = sessionStorageGetItem(`Page.scrollPositions.${key}.y`);

        return [parseInt(x, 10), parseInt(y, 10)];
    }

    static updateRavenContext(user) {
        if (!DEV_MODE) {
            if (user && user.id) {
                Raven.setUserContext({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                });
            } else {
                Raven.setUserContext();
            }
        }
    }

    componentDidMount() {
        this.onPageLoad(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.location.key !== nextProps.location.key) {
            this.onPageUnload();
            this.onPageLoad(nextProps);
        }

        View.updateRavenContext(nextProps.user);
    }

    componentWillUnmount() {
        this.onPageUnload();
    }

    onPageLoad(nextProps) {
        const {history: {action}, location: {key = 'root', pathname, search, hash}} = nextProps;
        let scrollToTop = hash.length === 0;

        if (window && window.ga) {
            // Track in Google Analytics
            window.ga('send', 'pageview', `${pathname}${search}`);
        }

        // POP means user is going forward or backward in history, restore previous scroll position
        if (action === 'POP') {
            const pos = View.getPageOffset(key);
            if (pos) {
                windowScroll(...pos);
                scrollToTop = false;
            }
        }

        if (scrollToTop) {
            // Scroll to top of viewport
            windowScroll(0, 0);
        }
    }

    onPageUnload() {
        // Remember scroll position so we can restore if we return to this view via browser history
        const {location: {key = 'root'}} = this.props;
        const [x, y] = windowPageOffset();
        View.setPageOffset(key, x, y);
    }

    renderChild = (child) => {
        const {isAuthenticated, user, activeLanguage} = this.props;
        return React.cloneElement(child, {user, isAuthenticated, activeLanguage});
    };

    render() {
        const {
            className, authRequired, title, location, isAuthenticated, children, error, NotFoundComponent,
        } = this.props;

        // Render redirect if not authenticated
        if (authRequired && !isAuthenticated) {
            return (
                <Redirect
                    push={false}
                    to={{
                        pathname: '/login',
                        state: {from: location},
                    }}
                />
            );
        }

        // Render default 404 or component provided with decorator
        if (error && error.statusCode === 404) {
            return <NotFoundComponent />;
        }

        // Render correct view wrapped in ErrorBoundary, view node is cloned and extra props are added
        return (
            <ErrorBoundary error={error}>
                <Helmet title={title} />
                <div className={className}>
                    {React.Children.map(children, this.renderChild)}
                </div>
            </ErrorBoundary>
        );
    }
}

export default View;{% endraw %}
