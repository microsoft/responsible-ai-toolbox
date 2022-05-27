const { spawnSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const commander = require("commander");
const { start } = require("repl");
const { exit } = require("process");

const baseDir = path.join(__dirname, "../notebooks/responsibleaidashboard");
const filePrefix = "responsibleaidashboard-";
// Please add notebook name into 'fileNames' array only when you are adding e2e tests to that notebook.
const fileNames = [
  "responsibleaidashboard-census-classification-model-debugging",
  "responsibleaidashboard-diabetes-regression-model-debugging",
  "responsibleaidashboard-housing-classification-model-debugging",
  "responsibleaidashboard-diabetes-decision-making",
  "responsibleaidashboard-housing-decision-making",
  "responsibleaidashboard-multiclass-dnn-model-debugging"
];
const flightCombinations = [[], ["newModelOverviewExperience"]];
const hostReg = /^ResponsibleAI started at (http:\/\/localhost:\d+)$/m;
const timeout = 3600;

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
  return new Promise((resolve) => {
    let stdout = "";
    const handleOutput = (data) => {
      const message = data.toString();
      stdout += message;
      console.log(message);
      if (hostReg.test(stdout)) {
        clearTimeout(timer);
        resolve(hostReg.exec(stdout)[1]);
      }
    };
    nbProcess.stdout.on("data", handleOutput);
    nbProcess.stderr.on("data", handleOutput);
    nbProcess.stdout.on("error", (error) => {
      throw error;
    });
  });
}

function addFlightsInFile(path, flights) {
  if (!fs.existsSync(path)) {
    throw new Error(`${path} does not exist.`);
  }
  let content = fs.readFileSync(path, { encoding: "utf-8" });
  let startIndex = 0;
  const dashboardConstructorCall = "ResponsibleAIDashboard(";
  while (startIndex < content.length) {
    startIndex = content.indexOf(dashboardConstructorCall, startIndex);
    console.log(startIndex);
    if (startIndex === -1) {
      break;
    }
    let dashboardArgsIndex = startIndex + dashboardConstructorCall.length;
    let parenthesesBalance = 1;
    while (parenthesesBalance > 0) {
      if (content.at(dashboardArgsIndex) === "(") {
        parenthesesBalance += 1;
      } else if (content.at(dashboardArgsIndex) === ")") {
        parenthesesBalance -= 1;
      }
      dashboardArgsIndex += 1;
    }
    content =
      content.slice(0, dashboardArgsIndex - 1) +
      `, feature_flights="${flights.join("&")}")` +
      content.slice(dashboardArgsIndex);
    startIndex = dashboardArgsIndex + 1;
  }
  const newPath =
    flights.length === 0
      ? path
      : path.slice(0, path.length - 3) + "-" + flights.join("-") + ".py";
  console.log(`writing notebook with flights to ${newPath}`);
  fs.writeFileSync(newPath, content, { encoding: "utf-8" });
}

function checkIfAllNotebooksHaveTests() {
  console.log(`Checking if all notebooks under ${baseDir} have tests`);
  const files = fs
    .readdirSync(baseDir)
    .filter((f) => f.startsWith(filePrefix) && f.endsWith(".ipynb"))
    .map((f) => f.replace(".ipynb", ""));
  const allNotebooksHaveTests = _.isEqual(_.sortBy(files), _.sortBy(fileNames));
  if (!allNotebooksHaveTests) {
    throw new Error(
      `Some of the notebooks don't have tests. If a new notebook is added, Please add tests.`
    );
  }
  console.log(`All notebooks have tests.`);
}

function convertNotebooks() {
  console.log("Converting notebooks");
  for (var flights of flightCombinations) {
    for (var fileName of fileNames) {
      console.log(
        `Converting notebook ${fileName} with ${
          flights.length === 0 ? "no " : ""
        }flights ${flights.toString()}\r\n`
      );
      const { status, stderr } = spawnSync(
        "jupyter",
        [
          "nbconvert",
          path.join(baseDir, `${fileName}.ipynb`),
          "--to",
          "script"
        ],
        {
          stdio: "inherit"
        }
      );
      if (flights.length > 0) {
        addFlightsInFile(path.join(baseDir, `${fileName}.py`), flights);
      }
      console.log(`Converted notebook ${fileName}\r\n`);
    }
  }
}
/**
 * @typedef {Object} Host
 * @property {string} file
 * @property {string} host
 */
/**
 * @returns {Host[]}
 */
async function runNotebooks(selectedNotebook) {
  let files = fs
    .readdirSync(baseDir)
    .filter((f) => f.startsWith(filePrefix) && f.endsWith(".py"));
  console.log("Available notebooks:");
  files.forEach((file) => {
    console.log(`    ${file}`);
  });
  if (selectedNotebook) {
    console.log(`Should only run ${selectedNotebook}`);
    files = files.filter((f) => f === selectedNotebook);
    if (files.length === 0) {
      console.log(
        `Could not find any matching notebook for ${selectedNotebook}.`
      );
      exit(1);
    }
  }
  const hosts = [];
  for (const f of files) {
    const host = await runNotebook(f);
    hosts.push({ file: f, host: host });
    console.log(`file: ${f}, host: ${host}`);
  }
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

function e2e(watch, selectedNotebook) {
  const nxPath = path.join(__dirname, "../node_modules/@nrwl/cli/bin/nx.js");
  console.log("Running e2e");
  let notebookArgs = [];
  if (selectedNotebook) {
    // remove prefix "responsibleaidashboard" and suffix ".py"
    // remove dashes and make camel case
    let notebookKey = selectedNotebook.substring(
      "responsibleaidashboard".length,
      selectedNotebook.length - 3
    );
    notebookKey = notebookKey
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
    console.log(
      `Determined notebook key ${notebookKey} for notebook ${selectedNotebook}.`
    );
    notebookArgs = ["--spec", `**/responsibleaitoolbox${notebookKey}/**`];
  }
  const { status, stderr } = spawnSync(
    "node",
    [
      nxPath,
      "e2e",
      "widget-e2e",
      ...notebookArgs,
      watch ? "--watch" : undefined
    ],
    {
      stdio: "inherit",
      cwd: path.join(__dirname, "..")
    }
  );
  if (status) {
    throw new Error(`Failed to run e2e:\r\n\r\n${stderr}`);
  }
  console.log("e2e finished\r\n");
}

async function main() {
  commander
    .option("-w, --watch", "Watch mode")
    .option("--skipgen", "Skip notebook generation")
    .option("-n, --notebook [notebook]", "Run specific notebook")
    .parse(process.argv)
    .outputHelp();
  checkIfAllNotebooksHaveTests();
  if (commander.opts().skipgen === undefined || !commander.opts().skipgen) {
    convertNotebooks();
  }
  const hosts = await runNotebooks(commander.opts().notebook);
  writeCypressSettings(hosts);
  e2e(commander.opts().watch, commander.opts().notebook);
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
