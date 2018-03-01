import PropTypes from 'prop-types';


const RouteLocationObject = {
    key: PropTypes.string,
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
    hash: PropTypes.string.isRequired,
};

export const RouterLocationShape = PropTypes.shape({
    ...RouteLocationObject,
    state: PropTypes.shape({
        from: PropTypes.shape(RouteLocationObject),
    }),
});

export const RouterMatchShape = PropTypes.shape({
    isExact: PropTypes.bool.isRequired,
    params: PropTypes.object.isRequired, // eslint-disable-line
    path: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
});

export const RouterHistoryShape = PropTypes.shape({
    action: PropTypes.string,
});


export const ErrorShape = PropTypes.shape({
    statusCode: PropTypes.number,
    message: PropTypes.string,
    stack: PropTypes.any,
});


export const UserShape = PropTypes.shape({
    id: PropTypes.number,
    email: PropTypes.string,
    name: PropTypes.string,
    is_superuser: PropTypes.bool,
    is_staff: PropTypes.bool,
    is_active: PropTypes.bool,
    last_login: PropTypes.string,
    date_joined: PropTypes.string,
});


export const UsersShape = PropTypes.shape({
    isAuthenticated: PropTypes.bool.isRequired,
    user: UserShape,
});


/**
 * Generate type for each field defined
 * @param fields - Array of field names
 * @param type - `PropType` for single field
 */
const getFieldMapping = (fields, type) => fields.reduce((result, current) => {
    result[current] = type; // eslint-disable-line no-param-reassign
    return result;
}, {});

export const getFormPropTypes = fields => ({
    values: PropTypes.shape(
        getFieldMapping(fields, PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool])),
    ).isRequired,
    status: PropTypes.string,
    errors: PropTypes.shape(getFieldMapping(fields, PropTypes.string)).isRequired,
    touched: PropTypes.shape(getFieldMapping(fields, PropTypes.bool)).isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleBlur: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
});
