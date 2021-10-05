jest.autoMockOff();
const defineTest = require('jscodeshift/dist/testUtils').defineTest;
defineTest(
  __dirname,
  'make-smart-enums',
  { extensions: 'ts' },
  'simple-union',
  {
    parser: 'ts',
  }
);
defineTest(
  __dirname,
  'make-smart-enums',
  { extensions: 'ts' },
  'advanced-union',
  {
    parser: 'ts',
  }
);
