/**
 * If you want to enable locale keys typechecking and enhance IDE experience.
 *
 * Requires `resolveJsonModule:true` in your tsconfig.json.
 *
 * @link https://www.i18next.com/overview/typescript
 */
import "i18next";

import auth from "../public/locales/en/auth.json";
import common from "../public/locales/en/common.json";
import translations from "../public/locales/en/translations.json";
import userDetails from "../public/locales/en/userDetails.json";

interface I18nNamespaces {
    auth: typeof auth;
    common: typeof common;
    translations: typeof translations;
    userDetails: typeof userDetails;
}

declare module "i18next" {
    interface CustomTypeOptions {
        // For legacy purposes default to "translations" namespace
        defaultNS: "translations";
        resources: I18nNamespaces;
        nsSeparator: ":";
        keySeparator: ".";
        returnObjects: false;
    }
}
