const { withReact } = require("@nx/react");
const { composePlugins, withNx } = require("@nx/webpack");

function withSvgr() {
  return (config) => {
    const svgLoaderIndex = config.module.rules.findIndex(
      (rule) =>
        typeof rule === "object" && rule.test?.toString().includes("svg")
    );
    if (svgLoaderIndex !== -1) {
      config.module.rules.splice(svgLoaderIndex, 1);
    }
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: require.resolve("@svgr/webpack"),
          options: {
            exportType: "named",
            namedExport: "ReactComponent",
            ref: true,
            svgo: false,
            titleProp: true
          }
        }
      ]
    });
    return config;
  };
}

module.exports = composePlugins(withNx(), withReact(), withSvgr(), (config) => {
  config.experiments = {
    ...config.experiments,
    outputModule: false
  };
  config.output.chunkFormat = "array-push";
  config.output.chunkLoading = "jsonp";
  config.output.module = false;
  config.output.publicPath = "";
  const htmlPlugin = config.plugins.find(
    (plugin) => plugin.constructor.name === "HtmlWebpackPlugin"
  );
  if (htmlPlugin) {
    htmlPlugin.options.scriptLoading = "defer";
    htmlPlugin.userOptions.scriptLoading = "defer";
  }
  config.resolve.fallback = {
    ...config.resolve.fallback,
    assert: require.resolve("assert/"),
    child_process: false,
    dgram: false,
    dns: false,
    fs: false,
    http2: false,
    module: false,
    net: false,
    stream: require.resolve("stream-browserify"),
    tls: false,
    url: require.resolve("url/")
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
});
