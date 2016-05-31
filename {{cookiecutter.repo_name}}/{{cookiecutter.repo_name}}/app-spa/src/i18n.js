import makeI18n, {setConfig, getConfig} from 'tg-i18n';

import logger from './logger';


setConfig('languageCode', DJ_CONST.LANGUAGE_CODE);
setConfig('localeData', DJ_CONST.LOCALE_DATA || {});
setConfig('logger', logger);

setConfig('onLanguageChange', theLanguage => {
    require('./actions/CurrentUserActions').default.changeLanguage(theLanguage);
});


const _i18n = makeI18n();

export default _i18n;
export const i18n = _i18n.i18n;
export const gettext = _i18n.gettext;
export const pgettext = _i18n.pgettext;
export const ngettext = _i18n.ngettext;
export const npgettext = _i18n.npgettext;
export const sprintf = _i18n.sprintf;
