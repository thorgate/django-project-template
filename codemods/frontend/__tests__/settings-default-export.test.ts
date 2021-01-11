const path = require('path');

jest.autoMockOff();
const defineTest = require('jscodeshift/dist/testUtils').defineTest;

defineTest(__dirname, 'transforms/settings-default-export', null, 'settings-default-export/all');
defineTest(__dirname, 'transforms/settings-default-export', null, 'settings-default-export/ts', { parser: 'ts' });
