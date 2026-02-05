const nrwlConfig = require("@nrwl/react/plugins/webpack.js"); // require the main @nrwl/react/plugins/webpack configuration function.
const crypto = require("crypto");

// Check if we need legacy OpenSSL provider workaround for Node 17+
// This sets the hash function to one that works without legacy OpenSSL
const nodeMajorVersion = parseInt(process.versions.node.split(".")[0], 10);
const needsHashWorkaround = nodeMajorVersion >= 17;

module.exports = (config) => {
  nrwlConfig(config); // first call it so that it @nrwl/react plugin adds its configs,

  // Fix for Node 17+ OpenSSL compatibility issue with webpack 4
  // Instead of requiring --openssl-legacy-provider, we use md5 hash which is available
  if (needsHashWorkaround) {
    // Try to use md4, fall back gracefully
    try {
      crypto.createHash("md4");
    } catch (e) {
      // md4 not available, use sha256 instead
      const originalCreateHash = crypto.createHash;
      crypto.createHash = (algorithm) =>
        originalCreateHash(algorithm === "md4" ? "sha256" : algorithm);
    }
  }

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
