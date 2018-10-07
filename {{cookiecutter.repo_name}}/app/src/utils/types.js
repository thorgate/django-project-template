import PropTypes from 'prop-types';


export const RouterLocationShape = PropTypes.shape({
    key: PropTypes.string,
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
    hash: PropTypes.string.isRequired,

    state: PropTypes.object, // eslint-disable-line
});


export const RouterMatchShape = PropTypes.shape({
    isExact: PropTypes.bool.isRequired,
    params: PropTypes.object.isRequired, // eslint-disable-line
    path: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
});


export const RouterRouteShapeObject = {
    exact: PropTypes.bool,
    location: RouterLocationShape,
    path: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    render: PropTypes.func,
    sensitive: PropTypes.bool,
    strict: PropTypes.bool,
    component: PropTypes.oneOfType([
        PropTypes.string, PropTypes.element, PropTypes.func,
        // ForwardRef's are currently not supported
        // See issue: https://github.com/facebook/prop-types/issues/200
        PropTypes.shape({ render: PropTypes.func }),
    ]),
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
};

export const RouterRouteShape = PropTypes.shape({
    ...RouterRouteShapeObject,
    routes: PropTypes.arrayOf(PropTypes.shape(RouterRouteShapeObject))
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
 * @param {string[]} fields - Array of field names
 * @param {Object} type - `PropType` for single field
 * @returns {Object} PropTypes for a form
 */
const getFieldMapping = (fields, type) => fields.reduce((result, current) => {
    result[current] = type; // eslint-disable-line no-param-reassign
    return result;
}, {});

export const getFormPropTypes = (fields) => ({
    values: PropTypes.shape(
        getFieldMapping(fields, PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool])),
    ).isRequired,
    status: PropTypes.shape({
        color: PropTypes.string,
        message: PropTypes.string,
        success: PropTypes.bool,
    }),
    errors: PropTypes.shape(getFieldMapping(fields, PropTypes.string)).isRequired,
    touched: PropTypes.shape(getFieldMapping(fields, PropTypes.bool)).isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleBlur: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
});

export const FormikFieldShape = PropTypes.shape({
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired,
});

export const FormikShape = PropTypes.shape({
    errors: PropTypes.object.isRequired,
    touched: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleBlur: PropTypes.func.isRequired,
    setFieldValue: PropTypes.func.isRequired,
    setFieldTouched: PropTypes.func.isRequired,
});

export const FieldProps = {
    props: {
        name: PropTypes.string.isRequired,
        formik: FormikShape.isRequired,

        id: PropTypes.string,
        label: PropTypes.node,
        inputAddonPrepend: PropTypes.node,
        inputAddonAppend: PropTypes.node,
        placeholder: PropTypes.string,
        check: PropTypes.bool,
        labelSize: PropTypes.number,
    },
    defaults: {
        id: null,
        label: null,
        inputAddonPrepend: null,
        inputAddonAppend: null,
        placeholder: null,
        check: false,
        labelSize: null,
    },
};
