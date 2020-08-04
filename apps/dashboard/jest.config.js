module.exports = {
    name: "dashboard",
    preset: "../../jest.config.js",
    transform: {
        "^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "@nrwl/react/plugins/jest",
        "^.+\\.[tj]sx?$": ["babel-jest", { cwd: __dirname, configFile: "./babel-jest.config.json" }],
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "html"],
    coverageDirectory: "../../coverage/apps/dashboard",
};
