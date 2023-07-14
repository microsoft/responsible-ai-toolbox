const { spawnSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const commander = require("commander");
const { exit } = require("process");

const nxPath = path.join(__dirname, "../node_modules/@nrwl/cli/bin/nx.js");
const baseDir = path.join(__dirname, "../notebooks/responsibleaidashboard");
const filePrefix = "responsibleaidashboard-";
// Please add notebook name into 'fileNames' array only when you are adding e2e tests to that notebook.
// Keep this list in sync with .github/workflows/CI-e2e-notebooks.yml and/or .github/workflows/CI-e2e-notebooks-vision.yml
const fileNames = [
  "responsibleaidashboard-census-classification-model-debugging",
  "responsibleaidashboard-diabetes-regression-model-debugging",
  "responsibleaidashboard-housing-classification-model-debugging",
  "responsibleaidashboard-diabetes-decision-making",
  "responsibleaidashboard-housing-decision-making",
  "responsibleaidashboard-multiclass-dnn-model-debugging",
  "responsibleaidashboard-fridge-multilabel-image-classification-model-debugging",
  "responsibleaidashboard-fridge-object-detection-model-debugging"
];
const notebookHostReg = /^ResponsibleAI started at (http:\/\/localhost:\d+)$/m;
const serveHostReg = /Web Development Server is listening at\s+(.*)$/m;
const timeout = 3600;

/**
 *
 * @param {string} host
 * @returns {Promise<string>}
 */
async function serve(host) {
  console.log(`Running nx serve`);
  const timer = setTimeout(() => {
    throw new Error(`serve timeout.`);
  }, timeout * 1000);
  const nbProcess = spawn("node", [nxPath, "serve", "widget"], {
    cwd: path.join(__dirname, ".."),
    env: {
      NX_based_url: host
    }
  });
  nbProcess.on("exit", () => {
    throw new Error(`Failed to run serve`);
  });
  return new Promise((resolve) => {
    let stdout = "";
    const handleOutput = (data) => {
      const message = data.toString();
      stdout += message;
      console.log(message);
      if (serveHostReg.test(stdout)) {
        clearTimeout(timer);
        resolve(serveHostReg.exec(stdout)[1]);
      }
    };
    nbProcess.stdout.on("data", handleOutput);
    nbProcess.stderr.on("data", handleOutput);
    nbProcess.stdout.on("error", (error) => {
      throw error;
    });
  });
}

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
      if (notebookHostReg.test(stdout)) {
        clearTimeout(timer);
        resolve(notebookHostReg.exec(stdout)[1]);
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
      `, feature_flights="${flights.split(",").join("&")}")` +
      content.slice(dashboardArgsIndex);
    startIndex = dashboardArgsIndex + 1;
  }
  console.log(`writing notebook with flights to ${path}`);
  fs.writeFileSync(path, content, { encoding: "utf-8" });
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

function convertNotebooks(notebook, flights) {
  console.log("Converting notebooks");
  for (var fileName of fileNames) {
    if (notebook && fileName !== notebook) {
      console.log(`Skipping ${fileName}. Looking for ${notebook} only.`);
      continue;
    }
    if (flights) {
      // flights were passed (not just -f without flights arg)
      console.log(
        `Converting notebook ${fileName} with flights ${flights.toString()}\r\n`
      );
    } else {
      // no flights were passed
      console.log(`Converting notebook ${fileName} with no flights.\r\n`);
    }
    const { status, stderr } = spawnSync(
      "jupyter",
      ["nbconvert", path.join(baseDir, `${fileName}.ipynb`), "--to", "script"],
      {
        stdio: "inherit"
      }
    );
    if (status) {
      throw new Error(`Failed to convert notebook:\r\n\r\n${stderr}`);
    }
    if (flights) {
      addFlightsInFile(path.join(baseDir, `${fileName}.py`), flights);
    }
    console.log(`Converted notebook ${fileName}\r\n`);
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
async function runNotebooks(selectedNotebook, host) {
  let files = fs
    .readdirSync(baseDir)
    .filter((f) => f.startsWith(filePrefix) && f.endsWith(".py"));
  console.log("Available notebooks:");
  files.forEach((file) => {
    console.log(`    ${file}`);
  });
  if (selectedNotebook) {
    const nbFileName = `${selectedNotebook}.py`;
    if (host) {
      files = [nbFileName];
    } else {
      console.log(`Should only run ${nbFileName}`);
      files = files.filter((f) => f === nbFileName);
      if (files.length === 0) {
        console.log(`Could not find any matching notebook for ${nbFileName}.`);
        exit(1);
      }
    }
  }
  const hosts = [];
  for (const f of files) {
    host = host || (await runNotebook(f));
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

function e2e(watch, selectedNotebook, flights, host) {
  console.log(`Running e2e for notebook ${selectedNotebook}`);
  let notebookArgs = [];
  if (selectedNotebook) {
    // remove prefix "responsibleaidashboard"
    // remove dashes and make camel case
    let notebookKey = selectedNotebook.substring(
      "responsibleaidashboard".length,
      selectedNotebook.length
    );
    notebookKey = notebookKey
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
    if (flights) {
      // append flights (if any) with first letter capitalized
      notebookKey =
        notebookKey +
        flights
          .split(",")
          .map((flight) => flight.charAt(0).toUpperCase() + flight.slice(1))
          .join("");
    }
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
    .option(
      "--host [host]",
      "Skip notebook running and use host provided to run e2e: use full url 'http://localhost:5000' or port number"
    )
    .option("-n, --notebook [notebook]", "Run specific notebook")
    .option(
      "-f, --flights [flights]",
      "Use flights separated by comma (no whitespace). Not specifying flights means that no flights are used."
    )
    .parse(process.argv)
    .outputHelp();
  const skipgen = commander.opts().skipgen;
  const watch = commander.opts().watch;
  let host = commander.opts().host;
  if (host && !isNaN(parseInt(host))) {
    host = `http://localhost:${host}`;
  }
  const notebook = commander.opts().notebook;
  if (host && !notebook) {
    throw new Error("Notebook is required when host is specified.");
  }
  let flights = commander.opts().flights;
  console.log("Checking flights: " + flights);
  if (flights?.toString() === "true") {
    // -f passed without arguments
    flights = undefined;
    console.log("setting flights to undefined!!!");
  }
  checkIfAllNotebooksHaveTests();
  if (!skipgen && !host) {
    convertNotebooks(notebook, flights);
  } else {
    console.log("Skipping converting notebooks", skipgen, host);
  }

  if (host && watch) {
    host = await serve(host);
  }
  console.log(`Running watch mode on ${host}`);

  const hosts = await runNotebooks(notebook, host);
  writeCypressSettings(hosts);
  for (var fileName of fileNames) {
    if (notebook && fileName !== notebook) {
      console.log(
        `Skipping e2e for ${fileName}. Looking for ${notebook} only.`
      );
      continue;
    }
    e2e(watch, fileName, flights, host);
  }
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
