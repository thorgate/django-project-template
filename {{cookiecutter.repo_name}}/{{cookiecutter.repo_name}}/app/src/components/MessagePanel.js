import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';


const MessagePanel = ({title, description, wide, children}) => (
    <div className={classNames('page-error-wrapper', {wide})}>
        <div className="login-background" />
        <div className="panel panel-shadow panel-message">
            {title && <h1>{title}</h1>}
            {description && <p className="text-muted">{description}</p>}
            {children}
        </div>
    </div>
);

MessagePanel.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    wide: PropTypes.bool,
    children: PropTypes.node,
};

MessagePanel.defaultProps = {
    title: null,
    description: null,
    wide: false,
    children: null,
};

export default MessagePanel;
