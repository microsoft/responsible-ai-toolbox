const nrwlConfig = require("@nrwl/react/plugins/bundle-rollup"); // require the main @nrwl/react/plugins/webpack configuration function.

module.exports = (config) => {
  config = nrwlConfig(config);
  config.context = "window";

  return config;
};
