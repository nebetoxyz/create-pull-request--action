export default {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ["./src/**"],
  coverageDirectory: "./reports",
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
  coverageReporters: ["json-summary", "text", "lcov"],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleFileExtensions: ["js"],
  testEnvironment: "node",
  testMatch: ["**/*.test.js"],
  testPathIgnorePatterns: ["/dist/", "/node_modules/"],
  verbose: true,
};
