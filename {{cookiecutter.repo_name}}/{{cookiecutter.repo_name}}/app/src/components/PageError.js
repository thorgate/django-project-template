import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

import Status from 'components/Status';
import MessagePanel from 'components/MessagePanel';
import {gettext} from 'utils/i18n';


const PageError = ({title, message, children, statusCode, wide}) => (
    <Status code={statusCode}>
        <div className="container">
            <MessagePanel title={title} description={message} wide={wide}>
                <Helmet title={title} />
                {children}
            </MessagePanel>
        </div>
    </Status>
);

PageError.propTypes = {
    statusCode: PropTypes.number,
    title: PropTypes.string,
    message: PropTypes.string,
    wide: PropTypes.bool,
    children: PropTypes.node,
};

PageError.defaultProps = {
    statusCode: 400,
    title: gettext('Error'),
    message: gettext('The server encountered an internal error and was unable to complete your request.'),
    wide: false,
    children: null,
};


export default PageError;
