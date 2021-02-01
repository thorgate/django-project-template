const path = require('path');

jest.autoMockOff();
const { defineTest } = require('jscodeshift/dist/testUtils');

defineTest(__dirname, 'transforms/tg-named-routes-resolve-path', null, 'tg-named-routes-resolve-path/all');
defineTest(__dirname, 'transforms/tg-named-routes-resolve-path', null, 'tg-named-routes-resolve-path/ts', { parser: 'ts' });

export {};
