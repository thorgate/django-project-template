import React from 'react';

import NotFound from 'components/NotFound';
import withView from 'decorators/withView';

import {gettext} from 'utils/i18n';

const PageNotFound = () => (
    <NotFound />
);

const PageNotFoundAsView = withView(gettext('Page not Found'))(PageNotFound);

export default PageNotFoundAsView;
