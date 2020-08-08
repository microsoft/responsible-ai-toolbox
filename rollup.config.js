const nrwlConfig = require("@nrwl/react/plugins/bundle-rollup"); // require the main @nrwl/react/plugins/webpack configuration function.

module.exports = options => {
    nrwlConfig(options); // first call it so that it @nrwl/react plugin adds its configs,

    // then override your config.
    return {
        ...options,
        onwarn(warning, warn) {
            // ignore
            if (warning.code === "THIS_IS_UNDEFINED" || warning.code === "CIRCULAR_DEPENDENCY") {
                return;
            }
            // treat as error
            if (warning.code === "NAMESPACE_CONFLICT") {
                throw new Error(warning);
            }

            warn(warning);
        },
    };
};
