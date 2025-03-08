export default {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ["./src/**"],
  coverageDirectory: "./reports/jest",
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
  coverageReporters: ["json-summary", "text", "lcov"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleFileExtensions: ["js"],
  testEnvironment: "node",
  testMatch: ["**/*.test.js"],
  testPathIgnorePatterns: ["/dist/", "/node_modules/"],
  verbose: true,
};
