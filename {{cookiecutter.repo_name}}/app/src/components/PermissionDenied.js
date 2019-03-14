import { PageError } from '@thorgate/spa-components';
import React from 'react';

import { gettext } from 'utils/i18n';


const PermissionDenied = () => (
    <PageError
        statusCode={403}
        title={gettext('Insufficient permissions')}
        description={gettext('You don\'t have permissions to access this page')}
    />
);


export default PermissionDenied;
