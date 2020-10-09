const fs = require("fs-extra");
const path = require("path");

const folders = {
  Interpret: "../libs/interpret/src/lib/Localization",
  Fairness: "../libs/Fairness/src/lib/Localization"
};
const targetFolder = "../libs/localization/src/lib/";
async function main() {
  const languages = new Set();
  const entries = {};
  for (const [project, folder] of Object.entries(folders)) {
    entries[project] = {};
    for (const json of fs
      .readdirSync(folder)
      .filter((f) => path.extname(f) === ".json")) {
      const file = path.join(folder, json);
      entries[project][json] = file;
      languages.add(json);
    }
  }
  for (const language of languages) {
    const targetFile = path.join(targetFolder, language);
    const content = {};
    for (const project of Object.keys(entries)) {
      if (entries[project][language]) {
        content[project] = fs.readJsonSync(entries[project][language]);
      }
    }
    fs.writeJSONSync(targetFile, content, { spaces: 2 });
  }
}

main();
