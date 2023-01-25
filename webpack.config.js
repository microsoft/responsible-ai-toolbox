const nrwlConfig = require("@nrwl/react/plugins/webpack.js"); // require the main @nrwl/react/plugins/webpack configuration function.

module.exports = (config) => {
  nrwlConfig(config); // first call it so that it @nrwl/react plugin adds its configs,

  config.node = {
    module: "empty",
    dgram: "empty",
    dns: "mock",
    fs: "empty",
    http2: "empty",
    net: "empty",
    tls: "empty",
    child_process: "empty"
  };
  config.module.rules.push({
    test: /\.py$/i,
    use: "raw-loader"
  });
  config.module.rules.unshift({
    test: /\.worker\.ts$/i,
    loader: "worker-loader",
    options: {
      inline: "no-fallback"
    }
  });

  if (process.env.debug) {
    require("fs-extra").writeJSONSync("./webpack.json", config, {
      spaces: 2
    });
  }
  return config;
};
