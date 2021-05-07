const nrwlConfig = require("@nrwl/react/plugins/bundle-rollup");
const svgr = require("@svgr/rollup");

module.exports = (config) => {
  config = nrwlConfig(config);

  config.context = "window";
  config.plugins.push(svgr.default());
  config.onwarn = (warning, warn) => {
    if (
      warning.code === "THIS_IS_UNDEFINED" ||
      warning.code === "CIRCULAR_DEPENDENCY" ||
      warning.code === "NAMESPACE_CONFLICT"
    ) {
      throw new Error(warning);
    }

    warn(warning);
  };

  if (process.env.debug) {
    require("fs-extra").writeJSONSync("./rollup.json", config, {
      spaces: 2
    });
  }
  return config;
};
