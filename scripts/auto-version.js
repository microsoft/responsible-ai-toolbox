"use strict";
const path = require("path");
const fs = require("fs-extra");
const semver = require("semver");
const { execSync } = require("child_process");
const commander = require("commander");

function getVersion(release) {
  const revision = execSync("git rev-list --count HEAD").toString().trim();
  const versionStr = fs.readFileSync("./version.cfg").toString().trim();
  var version = semver.parse(versionStr);
  if (release) {
    return `${version.major}.${version.minor}.${version.patch}`;
  } else {
    return `${version.major}.${version.minor}.${version.patch}.post${revision}`;
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

async function main() {
  commander
    .option("-p, --package [package]", "Specify a package name")
    .option("-r, --release", "Generate a release version")
    .parse(process.argv)
    .outputHelp();
  const pkg = commander.opts().package;
  const release = commander.opts().release;
  const workspace = fs.readJSONSync("workspace.json");
  const version = getVersion(release);
  fs.writeFileSync("./version.cfg", version);
  if (pkg) {
    await setVersion(workspace, pkg, version);
  } else {
    for (const eachPkg of Object.keys(workspace.projects)) {
      await setVersion(workspace, eachPkg, version);
    }
  }
  execSync(`git tag -a v${version} -m "Releasing v${version}"`);
  execSync(`git push origin v${version}`);
}

main();
