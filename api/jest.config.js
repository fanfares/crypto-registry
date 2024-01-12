const {pathsToModuleNameMapper} = require('ts-jest')
const {compilerOptions} = require('./tsconfig');

module.exports = {
    testEnvironment: 'node',
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>'}),
    moduleFileExtensions: [
        'js',
        'json',
        'ts',
        'tsx'
    ],
    testRegex: '/.*\\.(test|spec)?\\.(ts|tsx)$',
    transform: {
        '^.+\\.(ts|tsx|js|html)$': ['ts-jest', {
            isolatedModules: true
        }]
    },
    collectCoverageFrom: [
        '**/*.(t|j)s'
    ],
    testSequencer: './jest.sequencer.js',
    coverageDirectory: '../coverage',
    globalSetup: './jest.setup.ts',
    globalTeardown: './jest.teardown.ts'
};
