import PropTypes from 'prop-types';


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
