const { pathsToModuleNameMapper } = require('ts-jest')
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
const { compilerOptions } = require('./tsconfig');

module.exports = {
  // rootDir: 'src',
  preset: 'ts-jest',
  testEnvironment: 'node',
  // moduleNameMapper: {
  //   "@bcr/types": "<rootDir>/types"
  // },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>'}),
  moduleFileExtensions: [
    'js',
    'json',
    'ts'
  ],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  collectCoverageFrom: [
    '**/*.(t|j)s'
  ],
  coverageDirectory: '../coverage',
  globalSetup: './jest.setup.ts',
  globalTeardown: './jest.teardown.ts'
};
