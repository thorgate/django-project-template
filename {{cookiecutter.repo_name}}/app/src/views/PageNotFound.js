import React from 'react';

import NotFound from 'components/NotFound';
import withView from 'decorators/withView';

const PageNotFound = () => <NotFound />;

const PageNotFoundView = withView()(PageNotFound);

export default PageNotFoundView;
