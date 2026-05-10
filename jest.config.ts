import type { Config } from 'jest';

const config: Config = {
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
  // Suppress Prisma/Next.js noise in tests
  modulePathIgnorePatterns: ['.next'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { module: 'commonjs' } }],
  },
};

export default config;
