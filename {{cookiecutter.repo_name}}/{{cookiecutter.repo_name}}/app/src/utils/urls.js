const reverseUrl = (urlName, ...params) => {
    if (typeof DJ_CONST.reverse === 'function') {
        return DJ_CONST.reverse(urlName, ...params);
    }
    return DJ_CONST.reverse[urlName](...params);
};

export default reverseUrl;
