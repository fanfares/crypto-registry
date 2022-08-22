const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>'}),
  moduleFileExtensions: [
    'js',
    'json',
    'ts'
  ],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    '**/*.(t|j)s'
  ],
  coverageDirectory: '../coverage',
  globalSetup: './jest.setup.js',
  globalTeardown: './jest.teardown.js'
};
