function reverseUrl(urlName, ...params) {
    // DJ_CONST.reverse is mocked as a function in tests
    if (typeof DJ_CONST.reverse === 'function') {
        return DJ_CONST.reverse(urlName, ...params);
    }
    return DJ_CONST.reverse[urlName](...params);
}

export default reverseUrl;
