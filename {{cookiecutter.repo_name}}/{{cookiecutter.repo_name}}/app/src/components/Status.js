import React from 'react';
import PropTypes from 'prop-types';
import {Route} from 'react-router-dom';


const Status = ({code, children}) => (
    <Route
        render={({staticContext}) => {
            if (staticContext) {
                staticContext.status = code; // eslint-disable-line no-param-reassign
            }

            return children;
        }}
    />
);

Status.propTypes = {
    code: PropTypes.number.isRequired,
    children: PropTypes.node,
};

Status.defaultProps = {
    children: null,
};


export default Status;
