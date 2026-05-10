/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'lib/**/*.ts',
    'app/actions/**/*.ts',
    '!lib/prisma.ts',
    '!lib/email.ts',
  ],
  coverageReporters: ['text', 'lcov'],
  modulePathIgnorePatterns: ['.next'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { module: 'commonjs' } }],
  },
};

module.exports = config;
