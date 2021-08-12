import PropTypes from 'prop-types';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { createTitle, setTitle, selectTitle } from 'ducks/title';
import { useEffectOnce } from 'utils/hooks';

import Counter from '../Counter';
import WelcomeTest from '../WelcomeTest';
import styles from './HelloWorld.scss';

export const HelloWorldBase = ({ title }) => (
    <>
        <h1 className={styles.title}>{title}</h1>
        <Counter />
        <WelcomeTest name="from TypeScript" />
    </>
);

HelloWorldBase.propTypes = {
    title: PropTypes.string.isRequired,
};

const HelloWorld = () => {
    const dispatch = useDispatch();

    useEffectOnce(() => {
        dispatch(setTitle('Hello world from Redux!'));
        dispatch(createTitle('and from async too'));
        return true;
    }, []);

    const title = useSelector(selectTitle);

    return <HelloWorldBase title={title} />;
};

export default HelloWorld;
