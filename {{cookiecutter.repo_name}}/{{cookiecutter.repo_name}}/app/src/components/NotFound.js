import React from 'react';

import PageError from 'components/PageError';
import {gettext} from 'utils/i18n';


const NotFound = () => (
    <PageError clear statusCode={404} title={gettext('Page not Found')} message={gettext('Page not Found')} />
);


export default NotFound;
