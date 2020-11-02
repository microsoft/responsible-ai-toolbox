const plotlyFolder = "./node_modules/plotly.js/";
const jsPath = plotlyFolder + "dist/plotly.js";
const packagePath = plotlyFolder + "package.json";
const jsReg = /(define\(d3\).*)\n(\}\.apply\(self\)|\}\(\));/;
const packageReg = /\"main\":\s\"(.\/lib\/index\.js|\.\/dist\/plotly.js)",/;
const fs = require("fs");

function replaceFile(path, reg, to) {
  if (!fs.existsSync(path)) {
    throw new Error(`${path} does not exist.`);
  }
  let content = fs.readFileSync(path, { encoding: "utf-8" });
  if (!reg.test(content)) {
    throw new Error(`${path} has wrong content`);
  }
  content = content.replace(reg, to);
  fs.writeFileSync(path, content, { encoding: "utf-8" });
}

module.exports = function () {
  replaceFile(jsPath, jsReg, "$1\n}.apply(self);");
  replaceFile(packagePath, packageReg, '"main": "./dist/plotly.js",');
};
