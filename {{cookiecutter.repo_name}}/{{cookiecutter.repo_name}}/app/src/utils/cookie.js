/**
 * Set cookie value and when it expires
 * @param name
 * @param value
 * @param days
 */
export function setCookie(name, value, days = null) {
    if (typeof document !== 'undefined') {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = `; expires=${date.toGMTString()}`;
        }
        const path = '; path=/'; // Separate variable to get around warning from django's JS translation processing
        document.cookie = `${name}=${value}${expires}${path}`;
    }
}

/**
 * Get cookie value for `name`
 * @param name
 */
export function getCookie(name) {
    if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) { // eslint-disable-line no-restricted-syntax
            const trimmedCookie = cookie.trim();
            if (trimmedCookie.startsWith(name)) {
                return trimmedCookie.substring(name.length + 1, trimmedCookie.length);
            }
        }
    }
    return null;
}

/**
 * Delete cookie with name
 * @param name
 */
export function deleteCookie(name) {
    setCookie(name, '', -1);
}
