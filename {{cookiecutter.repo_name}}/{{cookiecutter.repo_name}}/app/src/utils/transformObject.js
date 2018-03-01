import {isObject, isFunction} from 'utils/typeChecks';

export default function transformObject(obj) {
    return Object.entries(obj).reduce((result, [key, value]) => {
        let newValue = value;
        if (isObject(value)) {
            newValue = transformObject(value);
        } else if (isFunction(value)) {
            newValue = 'Function';
        }
        result[key] = newValue;  // eslint-disable-line no-param-reassign

        return result;
    }, {});
}
