// Window object helpers to prevent usage of them on server side

export const windowScroll = (...args) => {
    if (typeof window !== 'undefined') {
        window.scroll(...args);
    }
};


export const sessionStorageSetItem = (...args) => {
    if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(...args);
    }
};


export const sessionStorageGetItem = (...args) => {
    if (typeof window !== 'undefined') {
        return window.sessionStorage.getItem(...args);
    }

    return null;
};


export const windowPageOffset = () => {
    if (typeof window !== 'undefined') {
        return [window.pageXOffset, window.pageYOffset];
    }

    return [0, 0];
};
