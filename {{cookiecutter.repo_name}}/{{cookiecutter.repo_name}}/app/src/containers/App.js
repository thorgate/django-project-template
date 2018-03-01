import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import {Route} from 'react-router-dom';
import {renderRoutes} from 'react-router-config';
import {Container} from 'reactstrap';

import NavigationBar from 'components/NavigationBar';
import ErrorBoundary from 'containers/ErrorBoundary';
import PendingDataRouter from 'containers/PendingDataRouter';


// Load styles early if browser and DEV_MODE
if (typeof window !== 'undefined' && DEV_MODE) {
    require('../../../static/styles-src/main'); // eslint-disable-line global-require
}


const App = ({route}) => (
    <ErrorBoundary>
        <Helmet titleTemplate="%s - {{cookiecutter.project_title}}" defaultTitle="{{cookiecutter.project_title}}" />
        <NavigationBar />
        <PendingDataRouter>
            <Container>
                {renderRoutes(route.routes)}
            </Container>
        </PendingDataRouter>
    </ErrorBoundary>
);

App.propTypes = {
    route: PropTypes.shape({
        routes: PropTypes.arrayOf(PropTypes.shape(Route.propTypes)),
    }).isRequired,
};

export default App;
