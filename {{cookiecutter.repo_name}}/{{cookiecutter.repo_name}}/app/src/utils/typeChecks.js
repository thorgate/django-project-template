/* global window */

export const hasValue = value => (
    typeof value !== 'undefined' && value !== null
);

export const isFunction = value => (
    (typeof window !== 'undefined' && value === window.alert) ||
    Object.prototype.toString.call(value) === '[object Function]'
);

export const isObject = value => (
    Object.prototype.toString.call(value) === '[object Object]'
);

export const isString = value => (
    Object.prototype.toString.call(value) === '[object String]'
);

export const isSubClass = (B, A) => (
    B.prototype instanceof A || B === A
);
