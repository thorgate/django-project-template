import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {createTitle} from '../ducks/title';

class HelloWorld extends React.Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        createTitle: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.createTitle('Hello world from Redux!');
    }

    render() {
        return (
            <h1>{this.props.title}</h1>
        );
    }
}

const mapStateToProps = state => ({
    title: state.title.title,
});

const mapDispatchToProps = dispatch => ({
    createTitle: title => dispatch(createTitle(title)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(HelloWorld);
