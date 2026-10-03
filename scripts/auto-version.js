"use strict";
const path = require("path");
const fs = require("fs-extra");
const semver = require("semver");
const { execSync } = require("child_process");
const commander = require("commander");

const versionCfgFile = "./version.cfg";
const versionPyFiles = [
  "./raiwidgets/raiwidgets/__version__.py",
  "./responsibleai/responsibleai/__version__.py"
];

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

function getProjects() {
  return ["apps", "libs"].flatMap((workspaceFolder) =>
    fs
      .readdirSync(workspaceFolder, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(workspaceFolder, entry.name, "project.json"))
      .filter((projectPath) => fs.existsSync(projectPath))
      .map((projectPath) => ({
        ...fs.readJSONSync(projectPath),
        root: path.dirname(projectPath)
      }))
  );
}

function updateInternalDependencyVersions(pkgSetting, version) {
  for (const dependencyType of [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies"
  ]) {
    const dependencies = pkgSetting[dependencyType];
    if (!dependencies) {
      continue;
    }
    for (const dependencyName of Object.keys(dependencies)) {
      if (dependencyName.startsWith("@responsible-ai/")) {
        dependencies[dependencyName] = version;
      }
    }
  }
}

function setVersion(setting, version, dryRun) {
  const pkgFolderName = setting.name;
  console.log(`\r\nProcessing: ${pkgFolderName}`);
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
    !setting.targets ||
    !setting.targets.build ||
    !setting.targets.build.options ||
    !setting.targets.build.options.outputPath
  ) {
    throw new Error(`outputPath for "${pkgFolderName}" is not set.`);
  }
  pkgSetting.version = version;
  updateInternalDependencyVersions(pkgSetting, version);
  if (dryRun) {
    console.log(`Would update: ${packagePath}`);
  } else {
    fs.writeJSONSync(packagePath, pkgSetting, { spaces: 2 });
  }
}

function writeVersion(version, dryRun) {
  if (dryRun) {
    console.log(`Would update Python and shared version files to ${version}.`);
    return;
  }
  fs.writeFileSync(versionCfgFile, version);
  for (const py of versionPyFiles) {
    fs.writeFileSync(py, `version = "${version}"`);
  }
}

async function main() {
  try {
    commander
      .option("-r, --release", "Generate a release version")
      .option("-t, --tag", "Generate a tag on git hub")
      .option("-d, --dry-run", "Show version changes without writing files")
      .parse(process.argv);
    const release = commander.opts().release;
    const tag = commander.opts().tag;
    const dryRun = commander.opts().dryRun;
    if (tag && dryRun) {
      throw new Error("--tag and --dry-run cannot be used together.");
    }
    const version = getVersion(release);
    writeVersion(version, dryRun);
    for (const project of getProjects()) {
      setVersion(project, version, dryRun);
    }
    if (tag) {
      console.log(`Creating tag v${version}`);
      execSync(`git config user.email "raiwidgets-maintain@microsoft.com"`);
      execSync(`git config user.name  "AML Rai Package Manager"`);
      execSync(`git add -A`);
      execSync(`git commit -m "Release v${version}"`);
      execSync(`git tag -a v${version} -m "Release v${version}"`);
      execSync(`git push origin v${version}`);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  getProjects,
  updateInternalDependencyVersions
};
