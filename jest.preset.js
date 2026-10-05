const nxPreset = require("@nx/jest/preset");
module.exports = {
  ...nxPreset,
  testMatch: ["**/+(*.)+(spec|test).+(ts|js)?(x)"],
  transform: {
    "^.+\\.(ts|js|html)$": "ts-jest"
  },
  resolver: "@nx/jest/plugins/resolver",
  moduleFileExtensions: ["ts", "js", "html"],
  testEnvironment: "jsdom",
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/src/**/*.ts?(x)"],
  coverageReporters: ["html", "cobertura", "lcov", "text", "json"],
  setupFilesAfterEnv: ["<rootDir>/../../setupTest.ts"],
  snapshotSerializers: ["enzyme-to-json/serializer"]
};
