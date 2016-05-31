import React, {PropTypes, Component} from 'react';
import {Link} from 'react-router';


class ListLink extends Component {
    static propTypes = {
        className: PropTypes.string,
        activeClassName: PropTypes.string.isRequired,
        to: PropTypes.oneOfType([PropTypes.string, PropTypes.route]).isRequired,
        params: PropTypes.object,
        query: PropTypes.object,
        activeStyle: PropTypes.object,
        onClick: PropTypes.func
    };
    static contextTypes = {
        router: PropTypes.func.isRequired
    };
    static defaultProps = Link.defaultProps;

    getActiveState() {
        return this.context.router.isActive(this.props.to, this.props.params, this.props.query);
    }

    getActiveClass() {
        return this.getActiveState() ? this.props.activeClassName : '';
    }

    getClassName() {
        return `${this.props.className} ${this.getActiveClass()}`;
    }

    render() {
        return (
            <li className={this.getClassName()}>
                <Link {...this.props} activeClassName="" />
            </li>
        );
    }
}

export default ListLink;
