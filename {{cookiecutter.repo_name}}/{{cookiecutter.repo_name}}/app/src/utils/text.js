import React from 'react';


export default function nl2br(text) {
    const res = [];
    text.split('\n').forEach((x, i) => {
        if (i !== 0) {
            res.push(<br key={`br-${i}`} />); // eslint-disable-line react/no-array-index-key
        }

        res.push(x);
    });

    return res;
}

/**
 * A wrapper for the global gettext so that it can be easily mocked in tests.
 * @param {string} text
 * @returns {string}
 */
export const gettext = text => window.gettext(text);

