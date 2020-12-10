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

if (
    typeof window !== 'undefined' &&
    (!window.django || !window.django.gettext)
) {
    const docsUrl =
        'https://docs.djangoproject.com/en/2.2/topics/i18n/translation/#module-django.views.i18n';
    // eslint-disable-next-line no-console
    console.error(
        'Did not find window.gettext - is Django JavascriptCatalog installed correctly?',
    );
    // eslint-disable-next-line no-console
    console.error(`  see more at ${docsUrl}`);
}

/**
 * @param {String} value
 *
 * @returns {String}
 */
export const gettext = (value) => django.gettext(value);

/**
 * @param {String} context
 * @param {String} value
 *
 * @returns {String}
 */
export const pgettext = (context, value) => django.pgettext(context, value);

/**
 * @param {String} singular
 * @param {String} plural
 * @param {Number} objectCount
 *
 * @returns {String}
 */
export const ngettext = (singular, plural, objectCount) =>
    django.ngettext(singular, plural, objectCount);

/**
 * @param {String} context
 * @param {String} singular
 * @param {String} plural
 * @param {Number} objectCount
 *
 * @returns {String}
 */
export const npgettext = (context, singular, plural, objectCount) =>
    django.npgettext(context, singular, plural, objectCount);

/**
 * The interpolate function dynamically populates a format string
 *
 * @example
 * const fmts = ngettext('There is %s object. Remaining: %s', 'There are %s objects. Remaining: %s', 11);
 * console.log(interpolate(fmts, [11, 20]) # 'There are 11 objects. Remaining: 20'
 *
 * @example
 *
 * const d = { count: 10, total: 50 };
 * const fmts = ngettext('Total: %(total)s, there is %(count)s object',
 *     'there are %(count)s of a total of %(total)s objects', d.count);
 * console.log(interpolate(fmts, d, true))
 */
export const interpolate = (formats, obj, named) =>
    django.interpolate(formats, obj, named);
