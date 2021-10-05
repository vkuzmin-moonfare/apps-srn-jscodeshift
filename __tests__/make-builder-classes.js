jest.autoMockOff();
const defineTest = require('jscodeshift/dist/testUtils').defineTest;
defineTest(
  __dirname,
  'make-builder-classes',
  { extensions: 'ts' },
  'builder-classes-main',
  {
    parser: 'ts',
  }
);
