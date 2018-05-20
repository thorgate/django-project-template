import React from 'react';
import makeI18n, {setConfig} from 'tg-i18n';


setConfig('languageCode', DJ_CONST.LANGUAGE_CODE);
setConfig('localeData', DJ_CONST.LOCALE_DATA || {});

const i18n = makeI18n();

i18n.ucfirst = str => `${str.charAt(0).toUpperCase()}${str.substr(1).toLowerCase()}`;

export const {gettext} = i18n;
export const {pgettext} = i18n;
export const {ngettext} = i18n;
export const {npgettext} = i18n;
export const {ucfirst} = i18n;
export const {interpolate} = i18n;

export const nl2br = (text) => {
    const res = [];
    text.split('\n').forEach((x, i) => {
        if (i !== 0) {
            res.push(<br key={`br-${i}`} />); // eslint-disable-line react/no-array-index-key
        }

        res.push(x);
    });

    return res;
};

export {setConfig} from 'tg-i18n';
export default i18n;
