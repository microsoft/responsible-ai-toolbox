"use strict";
const path = require("path");
const fs = require("fs-extra");
const semver = require("semver");
const fetch = require("./fetch");

function getTargetVersion(local, npmVersions) {
  if (!semver.valid(local)) {
    throw new Error(`Invalid version in package.json ${local}`);
  }
  if (npmVersions === "Not Found") {
    console.log(`Not found on npm, use package.json version ${local}`);
    return local;
  }
  if (!npmVersions.latest) {
    throw new Error(`Cannot find latest version from npm.\r\n${npmVersions}`);
  }
  const { latest } = npmVersions;
  if (!semver.valid(latest)) {
    throw new Error(`Invalid latest version on npm ${latest}`);
  }
  if (semver.major(latest) > semver.major(local)) {
    throw new Error(
      `Remote has greater major version. ${latest} > ${local}, update local major version first`
    );
  }
  if (
    semver.major(latest) === semver.major(local) &&
    semver.minor(latest) > semver.minor(local)
  ) {
    throw new Error(
      `Remote has greater minor version. ${latest} > ${local}, update local minor version first`
    );
  }
  if (semver.gte(latest, local)) {
    const target = semver.inc(latest, "patch");
    console.log(
      `Remote version is greater (${latest} >= ${local}) using ${target}`
    );
    return target;
  }
  console.log(`Local version is greater (${local} > ${latest}) using ${local}`);
  return local;
}

async function bump(workspace, pkgFolderName) {
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
  const outPkgPath = path.join(
    setting.architect.build.options.outputPath,
    "package.json"
  );
  if (!fs.existsSync(outPkgPath)) {
    throw new Error(`Package "${pkgFolderName}" is not built yet.`);
  }
  const local = pkgSetting.version || "0.0.1";
  const npmVersions = await fetch(pkgSetting.name);
  const target = getTargetVersion(local, npmVersions);
  pkgSetting.version = target;
  fs.writeJSONSync(outPkgPath, pkgSetting, { spaces: 2 });
}

async function main() {
  const pkg = process.argv[2];
  const workspace = fs.readJSONSync("workspace.json");
  if (pkg) {
    await bump(workspace, pkg);
  }
  if (!pkg) {
    for (const eachPkg of Object.keys(workspace.projects)) {
      await bump(workspace, eachPkg);
    }
  }
}

main();
