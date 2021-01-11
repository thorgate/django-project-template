jest.autoMockOff();
const { defineTest } = require('jscodeshift/dist/testUtils');

defineTest(__dirname, 'transforms/react-helmet-async-import', null, 'react-helmet-async-import/all');
defineTest(__dirname, 'transforms/react-helmet-async-import', null, 'react-helmet-async-import/ts', { parser: 'tsx' });

export {};
