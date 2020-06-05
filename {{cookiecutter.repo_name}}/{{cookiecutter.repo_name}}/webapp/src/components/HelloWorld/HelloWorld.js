import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { createTitle } from 'ducks/title';
import Counter from '../Counter';
import styles from './HelloWorld.scss';

export class HelloWorld extends React.Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        setTitle: PropTypes.func.isRequired,
    };

    componentDidMount() {
        const { setTitle } = this.props;

        setTitle('Hello world from Redux!');
    }

    render() {
        const { title } = this.props;

        return (
            <>
                <h1 className={styles.title}>{title}</h1>
                <Counter />
            </>
        );
    }
}

const mapStateToProps = state => ({
    title: state.title.title,
});

const mapDispatchToProps = dispatch => ({
    setTitle: title => dispatch(createTitle(title)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(HelloWorld);
