import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import rootReducer from '../reducers';

import { addDecorator } from '@storybook/react';

const store = createStore(rootReducer);

addDecorator(storyFn => <Provider store={store}>{storyFn()}</Provider>);
