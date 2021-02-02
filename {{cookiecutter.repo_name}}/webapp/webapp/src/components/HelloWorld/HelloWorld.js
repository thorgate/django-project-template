import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { setTitle } from 'ducks/title';
import Counter from '../Counter';
import styles from './HelloWorld.scss';

export class HelloWorld extends React.Component {
    componentDidMount() {
        const { onSetTitle } = this.props;

        onSetTitle('Hello world from Redux!');
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

HelloWorld.propTypes = {
    title: PropTypes.string.isRequired,
    onSetTitle: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
    title: state.title.title,
});

const mapDispatchToProps = (dispatch) => ({
    onSetTitle: (title) => dispatch(setTitle(title)),
});

export default connect(mapStateToProps, mapDispatchToProps)(HelloWorld);
