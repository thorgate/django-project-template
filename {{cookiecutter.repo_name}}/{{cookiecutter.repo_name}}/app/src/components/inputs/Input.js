import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';


const Input = ({id, name, label, placeholder, value, type, touched, error, onChange, onBlur}) => (
    <div className={classNames('form-group', {'has-error': error && touched})}>
        <label htmlFor={id || name}>{label}</label>
        <input
            type={type}
            className="form-control"
            id={id}
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            onBlur={onBlur}
        />
        {error && touched ? <span className="error-message">{error}</span> : null}
    </div>
);

Input.propTypes = {
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    label: PropTypes.node.isRequired,
    value: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    type: PropTypes.string,
    touched: PropTypes.bool,
    error: PropTypes.string,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
};

Input.defaultProps = {
    id: null,
    placeholder: null,
    type: 'text',
    touched: false,
    error: null,
    onChange: null,
    onBlur: null,
};

export default Input;
