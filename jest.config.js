module.exports = {
    verbose: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: [
        "<rootDir>/src"
    ],
    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },
    testMatch: ["**/*.test.ts"],
    testPathIgnorePatterns: ['/node_modules/', '.*.e2e.test.ts'],
    restoreMocks: true,
    clearMocks: true,
    resetMocks: true,
};
console.log('Loaded jest.config.js');