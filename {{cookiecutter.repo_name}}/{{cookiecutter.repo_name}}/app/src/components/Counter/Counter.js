import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Counter extends Component {
    static propTypes = {
        initialCount: PropTypes.number,
    };

    static defaultProps = {
        initialCount: 0,
    };

    state = {
        count: this.props.initialCount,
    };

    increment = () => {
        this.setState(state => ({count: state.count + 1}));
    };

    render() {
        return (
            <div>
                <h2>Count: {this.state.count}</h2>

                <button
                    type="button"
                    onClick={this.increment}
                >
                    Increment
                </button>
            </div>
        );
    }
}

export default Counter;
