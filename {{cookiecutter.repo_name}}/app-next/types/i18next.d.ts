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
import user from "../public/locales/en/user.json";

interface I18nNamespaces {
    auth: typeof auth;
    common: typeof common;
    user: typeof user;
}

declare module "i18next" {
    interface CustomTypeOptions {
        defaultNS: "common";
        resources: I18nNamespaces;
        nsSeparator: ":";
        keySeparator: ".";
        returnObjects: false;
    }
}
