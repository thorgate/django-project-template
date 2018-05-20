import {gettext} from 'utils/i18n';

export default (error, setStatus, setErrors) => {
    if (error.isNetworkError) {
        setStatus(gettext('Bad response from server, try again later'));
    } else if (error.isInvalidResponseCode) {
        setStatus(gettext('Bad response from server, try again later'));
    } else if (error.isValidationError) {
        const {nonFieldErrors} = error.errors;
        if (nonFieldErrors) {
            setStatus(nonFieldErrors.toString());
        }

        const fields = error.errors.filter(
            e => e.fieldName !== 'nonFieldErrors',
        ).map(
            e => ({field: e.fieldName, message: e.toString()}),
        ).reduce((result, current) => {
            result[current.field] = current.message; // eslint-disable-line no-param-reassign
            return result;
        }, {});
        setErrors(fields);
    }
};
