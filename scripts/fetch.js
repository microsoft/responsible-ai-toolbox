const fetch = require("node-fetch");

module.exports = async function (name) {
  const res = await fetch(
    `https://registry.npmjs.org/-/package/${name}/dist-tags`
  );
  return res.json();
};
