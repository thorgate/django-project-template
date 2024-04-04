import { ErrorBoundary } from "@thorgate/spa-errors";
import { PendingDataManager } from "@thorgate/spa-pending-data";
import React from "react";
import { RenderChildren } from "tg-named-routes";

import DefaultHeader from "@/src/components/DefaultHeader";
import NavigationBar from "@/src/components/NavigationBar";
import { onComponentError } from "@/src/services/sentry";
import { RouterMatchShape, RouterRouteShape } from "@/src/utils/types";

// Load main styles

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
