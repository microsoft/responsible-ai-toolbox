module.exports = {
  testMatch: ["**/+(*.)+(spec|test).+(ts|js)?(x)"],
  transform: {
    "^.+\\.(ts|js|html)$": "ts-jest"
  },
  resolver: "@nrwl/jest/plugins/resolver",
  moduleFileExtensions: ["ts", "js", "html"],
  coverageReporters: ["html"],
  setupFilesAfterEnv: ["<rootDir>/../../setupTest.ts"],
  moduleNameMapper: {
    "^@uifabric/foundation/lib/(.*)$": "@uifabric/foundation/lib-commonjs/$1",
    "^office-ui-fabric-react/lib/(.*)$":
      "office-ui-fabric-react/lib-commonjs/$1"
  },
  snapshotSerializers: ["enzyme-to-json/serializer"]
};
