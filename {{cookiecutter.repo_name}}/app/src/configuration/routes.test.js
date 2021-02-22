import { render } from '@testing-library/react';
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { RenderChildren, resolvePath } from 'tg-named-routes';

import routes from './routes';
import configureStore from './configureStore';
import i18next from './i18n-test';

describe('route config', () => {
    // eslint-disable-next-line jest/expect-expect
    test('Render does not break', () => {
        const { store } = configureStore(
            {},
            {
                location: '/',
            },
        );

        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={[resolvePath('landing')]}>
                    <HelmetProvider>
                        <I18nextProvider i18n={i18next}>
                            <RenderChildren routes={routes} />
                        </I18nextProvider>
                    </HelmetProvider>
                </MemoryRouter>
            </Provider>,
        );
    });
});
