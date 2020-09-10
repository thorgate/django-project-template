import { render } from '@testing-library/react';
import React from 'react';
import { StaticRouter } from 'react-router';
import { Provider } from 'react-redux';
import { RenderChildren } from 'tg-named-routes';

import routes from './routes';
import configureStore from './configureStore';

describe('route config', () => {
    test('Render does not break', () => {
        const { store } = configureStore(
            {},
            {
                location: '/',
            },
        );

        render(
            <Provider store={store}>
                <StaticRouter location="/">
                    <RenderChildren routes={routes} />
                </StaticRouter>
            </Provider>,
        );
    });
});
