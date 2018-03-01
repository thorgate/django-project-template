import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter, Route} from 'react-router';

import {pageLoad, pageUnload} from 'sagas/ViewManager';

import {RouterLocationShape} from 'utils/types';


const mapDispatchToProps = dispatch => ({
    onPageLoad: (...args) => dispatch(pageLoad(...args)),
    onPageUnload: (...args) => dispatch(pageUnload(...args)),
});

@withRouter
@connect(null, mapDispatchToProps)
class PendingDataRouter extends Component {
    static propTypes = {
        location: RouterLocationShape.isRequired,
        onPageLoad: PropTypes.func.isRequired,
        onPageUnload: PropTypes.func.isRequired,
        children: PropTypes.node.isRequired,
    };

    state = {
        previousLocation: null,
    };

    componentDidMount() {
        this.onPageLoad(this.props);
    }

    componentWillReceiveProps(nextProps) {
        const navigated = this.props.location !== nextProps.location;

        // When next location has state, render correct view without waiting to prevent redirect cycle
        // If problems occur with other use cases then I'll think of a better solution
        if (!DJ_CONST.KOA_APP_IS_EAGER && nextProps.location.state && nextProps.location.state.from) {
            this.onFinishedLoading();
        } else if (!DJ_CONST.KOA_APP_IS_EAGER && navigated) {
            this.setState({previousLocation: this.props.location});
        }

        if (navigated) {
            this.onPageUnload();
            this.onPageLoad(nextProps);
        }
    }

    componentWillUnmount() {
        this.onPageUnload();
    }

    onPageLoad(nextProps) {
        this.props.onPageLoad(nextProps.location, this.onFinishedLoading);
    }

    onPageUnload() {
        this.props.onPageUnload();
    }

    onFinishedLoading = () => this.setState({previousLocation: null});

    render() {
        const {location, children} = this.props;
        const {previousLocation} = this.state;

        return (
            <Route
                location={previousLocation || location}
                render={() => children}
            />
        );
    }
}

export default PendingDataRouter;
