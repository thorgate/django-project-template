import { ErrorBoundary } from '@thorgate/spa-errors';
import { PendingDataManager } from '@thorgate/spa-pending-data';
import React from 'react';
import { RenderChildren } from 'tg-named-routes';

import DefaultHeader from 'components/DefaultHeader';
import NavigationBar from 'components/NavigationBar';
import { onComponentError } from 'services/sentry';
import { RouterMatchShape, RouterRouteShape } from 'utils/types';

// Load main styles
import 'styles/main.scss';

const App = ({ route, match }) => (
    <ErrorBoundary onComponentError={onComponentError}>
        <DefaultHeader canonical={match.url} />
        <NavigationBar />
        <PendingDataManager>
            <RenderChildren route={route} />
        </PendingDataManager>
    </ErrorBoundary>
);

App.propTypes = {
    match: RouterMatchShape.isRequired,
    route: RouterRouteShape.isRequired,
};

export default App;
