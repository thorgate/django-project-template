// Add some helpful assertions
import 'jest-dom/extend-expect';

// react-testing-library renders components to document.body, this will ensure
// they're removed after each test.
import 'react-testing-library/cleanup-after-each';

// Mock global functions which depend on Django (DJ_CONST or gettext).
jest.mock('utils/text', () => ({gettext: text => text}));

