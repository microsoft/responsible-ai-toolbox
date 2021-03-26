const fs = require("fs-extra");
const path = require("path");
const baseDir = "./apps/dashboard-e2e/src/integration/interpret";
const all = fs
  .readdirSync(baseDir)
  .filter((child) => fs.lstatSync(path.join(baseDir, child)).isDirectory());
const fromFolder = all[0];

for (const toFolder of all) {
  for (const fileName of fs.readdirSync(path.join(baseDir, fromFolder))) {
    const fromFile = path.join(baseDir, fromFolder, fileName);
    const toFile = path.join(baseDir, toFolder, fileName);
    const fromContent = fs.readFileSync(fromFile, { encoding: "utf-8" });
    const toContent = fromContent.replace(
      new RegExp(fromFolder, "g"),
      toFolder
    );
    fs.writeFileSync(toFile, toContent, { encoding: "utf-8" });
  }
}
