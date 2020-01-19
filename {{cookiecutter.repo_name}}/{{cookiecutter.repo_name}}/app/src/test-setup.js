// Add some helpful assertions
import 'jest-dom/extend-expect';

// react-testing-library renders components to document.body, this will ensure
// they're removed after each test.
import 'react-testing-library/cleanup-after-each';

// Mock global Django JavascriptCatalog methods
/* eslint-disable no-confusing-arrow */
global.django = {
    gettext: text => text,
    pgettext: (context, text) => text,
    ngettext: (singular, plural, objectCount) => objectCount !== 1 ? plural : singular,
    npgettext: (context, singular, plural, objectCount) => objectCount !== 1 ? plural : singular,
    interpolate: formats => formats,
};
/* eslint-enable no-confusing-arrow */

// Mock global DJ_CONST.reverse (from https://github.com/ierror/django-js-reverse)
global.DJ_CONST = global.DJ_CONST || {};
global.DJ_CONST.reverse = (urlName, ...params) => `reverse('${urlName}', '${params.join(', ')}')`;
