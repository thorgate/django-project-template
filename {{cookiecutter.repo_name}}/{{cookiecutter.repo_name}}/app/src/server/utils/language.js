import is from 'is';


export default function getLanguage(ctx) {
    const cookies = ctx.cookie;
    const language = (cookies ? cookies[DJ_CONST.LANGUAGE_COOKIE_NAME] : null) || DJ_CONST.LANGUAGE_CODE;

    if (is.undef(DJ_CONST.LOCALE_DATA || {})[language]) {
        return DJ_CONST.LANGUAGE_CODE;
    }

    return language;
}
