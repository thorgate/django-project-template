jest.autoMockOff();
const { defineTest } = require('jscodeshift/dist/testUtils');

defineTest(__dirname, 'transforms/legacy-app-imports', null, 'legacy-app-imports/all');
defineTest(__dirname, 'transforms/legacy-app-imports', null, 'legacy-app-imports/ts', { parser: 'tsx' });

export {};
