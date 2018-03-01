import React from 'react';
import PropTypes from 'prop-types';


const Loading = ({error, pastDelay}) => {
    if (error) {
        return <div>Error loading component!</div>;
    } else if (pastDelay) {
        return <div>Loading...</div>;
    } else {
        return null;
    }
};

Loading.propTypes = {
    error: PropTypes.bool,
    pastDelay: PropTypes.bool,
};

Loading.defaultProps = {
    error: false,
    pastDelay: false,
};

export default Loading;
