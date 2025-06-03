// Global Jest configuration for all tests
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '../../',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  testMatch: ['**/*.test.(ts|tsx|js|jsx)'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  moduleNameMapper: {
    // Add any path aliases here
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/tests/**',
    '!src/**/index.{ts,tsx}',
    '!src/**/types.{ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
