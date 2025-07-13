/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/jest-setup.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(@noble|@scure|@ethereumjs)/)'
  ],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1'
  },
  globalSetup: '<rootDir>/test/setup.ts',
  globalTeardown: '<rootDir>/test/teardown.ts'
};