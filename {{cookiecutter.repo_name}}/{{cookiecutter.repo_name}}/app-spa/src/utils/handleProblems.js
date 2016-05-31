import React, {Component} from 'react';
import is from 'is';

import {gettext} from '../i18n';


const defaultErrors = () => {
    return {
        403: gettext('Not authorized to access object %s'),
        404: gettext('Object %s does not exist'),
        500: gettext('Something went wrong')
    };
};

/**
 * 'Higher Order Component' that simplifies per-view
 *  problem handling (403, 404, etc). This exposes prop onProblem (problem[, objIdentifier])
 *  on the Component which can be used to trigger the rendering of ProblemComponent.
 *
 *  Can be used directly:
 *
 *   >>> handleProblems()(MyComponent)
 *
 *  or as a ES7 decorator:
 *
 *   >>> @handleProblems()
 *   >>> class MyComponent extends Component {...}
 *
 * @param ProblemComponent Component to render when error occurs
 * @param [propProblem] Optional callable that can be used to set problem based on incoming props
 * @param [errors] Optional errors dict. If omitted, default errors are used.
 */
export default function handleProblems(ProblemComponent, propProblem, errors) {
    errors = errors || defaultErrors();

    return function(ChildComponent) {
        class ProblemHelper extends Component {
            constructor(props) {
                super(props);

                this.state = {
                    problem: null,
                    objIdentifier: null
                };

                if (is.fn(propProblem)) {
                    const problem = propProblem(props);

                    if (problem) {
                        this.onProblem(problem, null, true);
                    }
                }
            }

            componentWillReceiveProps(newProps) {
                if (is.fn(propProblem)) {
                    const problem = propProblem(newProps);

                    if (problem) {
                        this.onProblem(problem, null);
                    }
                }
            }

            onProblem(problem, objIdentifier, isInitial) {
                if (is.array(problem)) {
                    objIdentifier = problem[1];
                    problem = problem[0];
                }

                if (is.number(problem) || errors[problem]) {
                    problem = errors[problem];
                } else {
                    problem = defaultErrors['500'];
                }

                if (isInitial) {
                    this.state.problem = problem || null;
                    this.state.objIdentifier = objIdentifier || null;
                } else {
                    this.setState({
                        problem: problem || null,
                        objIdentifier: objIdentifier || ''
                    });
                }
            }

            getProblemStr() {
                return this.state.problem.replace(' %s', ` ${this.state.objIdentifier}`).replace('%s', `${this.state.objIdentifier}`);
            }

            render() {
                let body;

                if (this.state.problem) {
                    body = (<ProblemComponent key="problem" problem={this.getProblemStr()} />);
                }

                else {
                    body = (<ChildComponent key="real" onProblem={(p, o) => { this.onProblem(p, o); }} {...this.props} />);
                }

                return (
                    <div>{body}</div>
                );
            }
        }

        // If the view uses connectToStores, we want to pass statics around
        if (ChildComponent.getPropsFromStores) {
            ProblemHelper.getPropsFromStores = ChildComponent.getPropsFromStores;
        }
        if (ChildComponent.getStores) {
            ProblemHelper.getStores = ChildComponent.getStores;
        }
        if (ChildComponent.componentDidConnect) {
            ProblemHelper.componentDidConnect = ChildComponent.componentDidConnect;
        }

        return ProblemHelper;
    };
}

