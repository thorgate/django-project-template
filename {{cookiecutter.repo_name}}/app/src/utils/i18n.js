import React from 'react';


export const upperCaseFirst = (str) => (
    `${str.charAt(0).toUpperCase()}${str.substr(1).toLowerCase()}`
);

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


// No-op methods for translations
// This is kept here to find correct usages for upgrade to new `tg-i18n`
export const gettext = (text) => text;
export const pgettext = (context, text) => text;
