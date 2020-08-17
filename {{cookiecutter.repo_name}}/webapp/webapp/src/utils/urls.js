const reverseUrl = (urlName, ...params) => {
    {%- if cookiecutter.webapp_include_storybook == "yes" %}
    // DJ_CONST.reverse is mocked as a function in storybook
    if (typeof DJ_CONST.reverse === 'function') {
        return DJ_CONST.reverse(urlName, ...params);
    }
    {%- endif %}
    return DJ_CONST.reverse[urlName](...params);
};

export default reverseUrl;
