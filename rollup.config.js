const nrwlConfig = require("@nx/react/plugins/bundle-rollup");
const svgr = require("@svgr/rollup");
const fs = require("fs-extra");
const path = require("path");

const bundledPackages = new Set([
  "d3-array",
  "d3-color",
  "d3-hierarchy",
  "d3-interpolate",
  "d3-scale",
  "d3-selection",
  "d3-shape"
]);

function preserveLegacyDeclarationPaths() {
  return {
    name: "preserve-legacy-declaration-paths",
    writeBundle(outputOptions) {
      if (!outputOptions.dir) {
        return;
      }
      const sourcePath = path.join(outputOptions.dir, "src");
      if (fs.existsSync(sourcePath)) {
        for (const entry of fs.readdirSync(sourcePath, {
          withFileTypes: true
        })) {
          if (entry.isDirectory()) {
            fs.copySync(
              path.join(sourcePath, entry.name),
              path.join(outputOptions.dir, entry.name),
              { overwrite: true }
            );
          }
        }
      }
      const indexDeclarationPath = path.join(outputOptions.dir, "index.d.ts");
      if (fs.existsSync(indexDeclarationPath)) {
        const declaration = fs.readFileSync(indexDeclarationPath, "utf8");
        fs.writeFileSync(
          indexDeclarationPath,
          declaration
            .replaceAll("\\", "/")
            .replace(/\.\/src\/+index/g, "./src/index")
        );
      }
    }
  };
}

module.exports = (config) => {
  config = nrwlConfig(config);

  config.context = "window";
  const isExternal = config.external;
  config.external = (id, importer, isResolved) => {
    if (
      [...bundledPackages].some(
        (packageName) => id === packageName || id.startsWith(`${packageName}/`)
      )
    ) {
      return false;
    }
    if (typeof isExternal === "function") {
      return isExternal(id, importer, isResolved);
    }
    if (Array.isArray(isExternal)) {
      return isExternal.includes(id);
    }
    return false;
  };
  const outputs = Array.isArray(config.output)
    ? config.output
    : [config.output];
  for (const output of outputs) {
    if (output.format === "cjs") {
      output.interop = "auto";
    }
  }
  config.plugins.push(preserveLegacyDeclarationPaths());
  config.plugins.push(svgr.default());
  config.onwarn = (warning, warn) => {
    const isBundledPackageCircularDependency =
      warning.code === "CIRCULAR_DEPENDENCY" &&
      warning.ids?.every((id) => /[\\/]node_modules[\\/]d3-/.test(id));
    if (isBundledPackageCircularDependency) {
      warn(warning);
      return;
    }
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
