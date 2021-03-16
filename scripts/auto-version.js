"use strict";
const path = require("path");
const fs = require("fs-extra");
const semver = require("semver");
const { execSync } = require("child_process");
const commander = require("commander");

const versionCfgFile = "./version.cfg";
const versionPyFiles = ["./raiwidgets/raiwidgets/__version__.py"];

function getVersion(release) {
  const revision = execSync("git rev-list --count HEAD").toString().trim();
  const versionStr = fs.readFileSync(versionCfgFile).toString().trim();
  var version = semver.coerce(versionStr, true);
  if (release) {
    return `${version.major}.${version.minor}.${version.patch}`;
  } else {
    return `${version.major}.${version.minor}.${version.patch}-${revision}`;
  }
}

async function setVersion(workspace, pkgFolderName, version) {
  console.log(`\r\nProcessing: ${pkgFolderName}`);
  const setting = workspace.projects[pkgFolderName];
  if (!setting) {
    throw new Error(`Package "${pkgFolderName}" does not exist.`);
  }
  if (!setting.root) {
    throw new Error(`Root folder for "${pkgFolderName}" is not set.`);
  }
  const packagePath = path.join(setting.root, "package.json");
  if (!fs.existsSync(packagePath)) {
    console.log(`Skipping: No package.json found, ${packagePath}`);
    return;
  }
  const pkgSetting = fs.readJsonSync(packagePath);
  if (!pkgSetting.name) {
    console.log(`Skipping: No package name`);
    return;
  }
  if (
    !setting.architect ||
    !setting.architect.build ||
    !setting.architect.build.options ||
    !setting.architect.build.options.outputPath
  ) {
    throw new Error(`outputPath for "${pkgFolderName}" is not set.`);
  }
  pkgSetting.version = version;
  fs.writeJSONSync(packagePath, pkgSetting, { spaces: 2 });
}

function writeVersion(version) {
  fs.writeFileSync(versionCfgFile, version);
  for (const py of versionPyFiles) {
    fs.writeFileSync(py, `version = "${version}"`);
  }
}

async function main() {
  commander
    .option("-r, --release", "Generate a release version")
    .parse(process.argv)
    .outputHelp();
  const release = commander.opts().release;
  const workspace = fs.readJSONSync("workspace.json");
  const version = getVersion(release);
  writeVersion(version);
  for (const eachPkg of Object.keys(workspace.projects)) {
    await setVersion(workspace, eachPkg, version);
  }
  if (release) {
    execSync(`git add -A`);
    execSync(`git commit -m "Release v${version}"`);
    execSync(`git tag -a v${version} -m "Release v${version}"`);
    execSync(`git push origin v${version}`);
  }
}

main();
