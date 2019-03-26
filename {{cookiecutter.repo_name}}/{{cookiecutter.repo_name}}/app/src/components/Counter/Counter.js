import React, {useState} from 'react';
import PropTypes from 'prop-types';

const Counter = ({initialCount}) => {
    const [count, setCount] = useState(initialCount);
    const increment = () => setCount(count + 1);

    return (
        <div>
            <h2>Count: {count}</h2>
            <button
                type="button"
                onClick={increment}
            >
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
