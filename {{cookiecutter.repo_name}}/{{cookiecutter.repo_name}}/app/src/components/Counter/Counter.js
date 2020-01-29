import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const Counter = ({ initialCount }) => {
    const [count, setCount] = useState(initialCount);
    const increment = useCallback(() => setCount(count + 1), [count]);

    return (
        <div>
            <h2>Count: {count}</h2>
            <button type="button" onClick={increment}>
                Increment
            </button>
        </div>
    );
};

Counter.propTypes = {
    initialCount: PropTypes.number,
};

Counter.defaultProps = {
    initialCount: 0,
};

export default Counter;
