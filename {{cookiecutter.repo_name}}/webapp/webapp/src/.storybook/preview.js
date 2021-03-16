import { addDecorator } from '@storybook/react';

import React from 'react';
import { Provider } from 'react-redux';

import './globals';
import createAppStore from '../store';

const store = createAppStore({});

addDecorator((storyFn) => <Provider store={store}>{storyFn()}</Provider>);
