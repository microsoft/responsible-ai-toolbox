const { spawnSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const commander = require("commander");

const baseDir = path.join(
  __dirname,
  "../notebooks/responsibleaitoolbox-dashboard"
);
const filePrefix = "responsibleaitoolbox";

const hostReg = /^ModelAssessment started at (http:\/\/localhost:\d+)$/m;
const timeout = 600;

/**
 *
 * @param {string} name
 * @returns {Promise<string>}
 */
async function runNotebook(name) {
  console.log(`Running ${name}`);
  const timer = setTimeout(() => {
    throw new Error(`${name} timeout.`);
  }, timeout * 1000);
  const nbProcess = spawn("python", ["-i", path.join(baseDir, name)]);
  nbProcess.on("exit", () => {
    throw new Error(`Failed to run notebook ${name}`);
  });
  let stdout = "";
  return new Promise((resolve) => {
    nbProcess.stdout.on("data", (data) => {
      const message = data.toString();
      stdout += message;
      console.log(name, message);
      if (hostReg.test(stdout)) {
        clearTimeout(timer);
        resolve(hostReg.exec(stdout)[1]);
      }
    });
  });
}

function convertNotebook() {
  console.log("Converting notebook");
  const { status, stderr } = spawnSync(
    "jupyter",
    ["nbconvert", path.join(baseDir, `${filePrefix}*.ipynb`), "--to", "script"],
    {
      stdio: "inherit"
    }
  );
  if (status) {
    throw new Error(`Failed to convert notebook:\r\n\r\n${stderr}`);
  }
  console.log("Converted notebook\r\n");
}
/**
 * @typedef {Object} Host
 * @property {string} file
 * @property {string} host
 */
/**
 * @returns {Host[]}
 */
async function runNotebooks() {
  const files = fs
    .readdirSync(baseDir)
    .filter((f) => f.startsWith(filePrefix) && f.endsWith(".py"));
  const output = await Promise.all(files.map(runNotebook));
  const hosts = files.map((f, i) => ({ file: f, host: output[i] }));
  console.log(hosts);
  return hosts;
}

/**
 *
 * @param {Host[]} hosts
 */
function writeCypressSettings(hosts) {
  fs.writeFileSync(
    path.join(__dirname, "../apps/widget-e2e/cypress.env.json"),
    JSON.stringify({
      hosts
    })
  );
}

function e2e(watch) {
  const nxPath = path.join(__dirname, "../node_modules/@nrwl/cli/bin/nx.js");
  console.log("Running e2e");
  const { status, stderr } = spawnSync(
    "node",
    [nxPath, "e2e", "widget-e2e", watch ? "--watch" : undefined],
    {
      stdio: "inherit",
      cwd: path.join(__dirname, "..")
    }
  );
  if (status) {
    throw new Error(`Failed to run e2e:\r\n\r\n${stderr}`);
  }
  console.log("E2e finished\r\n");
}

async function main() {
  commander
    .option("-w, --watch", "Watch mode")
    .parse(process.argv)
    .outputHelp();
  convertNotebook();
  const hosts = await runNotebooks();
  writeCypressSettings(hosts);
  e2e(commander.opts().watch);
  process.exit(0);
}
function onExit() {
  console.log("Existing e2e");
}
async function onExitRequested() {
  process.exit();
}

main();

process.stdin.resume();
process.on("SIGINT", onExitRequested);

// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", onExitRequested);
process.on("SIGUSR2", onExitRequested);

process.on("exit", onExit);
