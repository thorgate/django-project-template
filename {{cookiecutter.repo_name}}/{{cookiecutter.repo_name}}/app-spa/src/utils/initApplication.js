{% raw %}import React, {Component, PropTypes} from 'react';
import AltIso from 'alt/utils/AltIso';

import SeoStore from '../stores/SeoStore';
import SeoActions from '../actions/SeoActions';
import CurrentUserStore from '../stores/CurrentUserStore';
import connectToStores from 'alt/utils/connectToStores';


// This ensures the seo store is initialised server-side
SeoStore.getMeta();


/**
 * Helper Component which let's us sneak past this issue:
 *
 * - https://github.com/goatslacker/alt/issues/334
 *
 * Note: Just a passthrough server-side
 *
 * @param ChildComponent
 * @return {*}
 */
function withBuffer(ChildComponent) {
    const classObj = {
        render() {
            return (<ChildComponent {...this.props} />);
        }
    };

    if (typeof window !== 'undefined') {
        classObj.getChildContext = function() {
            return { buffer: this.props.buffer };
        };

        classObj.childContextTypes = {
            buffer: PropTypes.object.isRequired
        };
    }

    return React.createClass(classObj);
}


/**
 * 'Higher Order Component' that initializes the application,
 *   by hooking up it with cookies context and catching
 *   page faults.
 */
function initApplication(ErrorComponent) {
    return function(ChildComponent) {
        @AltIso.define((props) => {
            return Promise.all([
                new Promise((resolve) => {
                    SeoActions.setTitle('{% endraw %}{{ cookiecutter.project_title }}{% raw %}');
                    SeoActions.setDesc('{% endraw %}{{ cookiecutter.project_title }}{% raw %} generated from the template');
                    SeoActions.setKeywords('react,alt,flux,thorgate,django');
                    SeoActions.setOgImage('/assets/images/logo_white.svg');

                    resolve();
                }),
                CurrentUserStore.getCurrentUser()
            ]);
        })
        @connectToStores
        class AppSetupComponent extends Component {
            static propTypes = {
                user: PropTypes.object
            };

            static getPropsFromStores() {
                return {user: CurrentUserStore.getState()};
            }

            static getStores() {
                return [CurrentUserStore];
            }

            constructor(props) {
                super(props);

                this.doRaven(props);
            }

            componentWillReceiveProps(nextProps) {
                this.doRaven(nextProps);
            }

            doRaven(nextProps) {
                if (nextProps.user && nextProps.user.isAuthenticated) {
                    if (typeof window !== 'undefined') {
                        /* eslint-disable */
                        if (typeof Raven !== 'undefined') {
                            Raven.setUserContext({
                                id: nextProps.user.profile.id,
                                email: nextProps.user.profile.email,
                                name: nextProps.user.profile.displayName
                            });
                        }
                        /* eslint-enable */
                    }
                }
            }

            render() {
                let body;

                if (this.props.user.pageFault) {
                    body = (<ErrorComponent key="err" pageFault={this.props.user.pageFault} />);
                }

                else {
                    body = (
                        <ChildComponent key="real" {...this.props} />
                    );
                }

                return (
                    <div>{body}</div>
                );
            }
        }

        return withBuffer(AppSetupComponent);
    };
}

export default initApplication;{% endraw %}
