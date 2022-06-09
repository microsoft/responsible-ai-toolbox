# Contributing

## Contributor license agreement

This project welcomes contributions and suggestions. Most contributions
require you to agree to a Contributor License Agreement (CLA) declaring that
you have the right to, and actually do, grant us the rights to use your
contribution. For details, visit <https://cla.opensource.microsoft.com>.

When you submit a pull request, a CLA bot will automatically determine whether
you need to provide a CLA and decorate the PR appropriately (e.g., status
check, comment). Simply follow the instructions provided by the bot. You will
only need to do this once across all repos using our CLA.

If you have previously committed changes that were not signed follow
[these steps](https://dev.to/jrushlow/oops-i-forgot-to-sign-my-commit-from-last-monday-2jke)
to sign them retroactively after setting up your GPG key as described in the
[GitHub documentation](https://docs.github.com/en/github/authenticating-to-github/managing-commit-signature-verification).

Setting up a GPG key has three stages:

1. [Generate the key](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/generating-a-new-gpg-key)
1. [Tell GitHub about the key](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/adding-a-new-gpg-key-to-your-github-account)
1. [Instruct Git to sign using your key](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/telling-git-about-your-signing-key)

Note that the `GitBash` shell installed by Git on Windows already has GPG
installed, so there is no need to install GPG separately.

## Code of conduct

This project has adopted the
[Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the
[Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any
additional questions or comments.

## Acceptance criteria

All pull requests need to abide by the following criteria to be accepted:

- passing pipelines on the GitHub pull request
- signed [Contributor License Agreement (CLA)](#contributor-license-agreement)
- approval from at least one [maintainer](./README.md#maintainers)
- compatibility with light / dark / high-contrast themes
- fits with overall look-and-feel of the widget
- accessibility (to be clarified)
- support for localization in code (translations need not be provided)
- tests for added / changed functionality

## Development process

First ensure you have
[npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
installed (which in turn may require installing `node`).
Using npm you can install `yarn` as follows:

```
npm install -g yarn
```

If `yarn --version` succeeds you can proceed.
If not, you may have to follow the instructions printed by your shell.
If you're using Powershell you may have to bypass the execution policy
to allow `yarn` to execute. One way to do this is `Set-ExecutionPolicy -ExecutionPolicy Bypass`.

For all further steps `yarn install` is a prerequisite.
Run the `yarn install` command from your repository root directory.

To run the dashboards locally run the following from the root of the
repository on your machine:

```
yarn start
```

which can take a few seconds before printing out

```
$ nx serve

> nx run dashboard:serve
**
Web Development Server is listening at http://localhost:4200/
**
```

at which point you can follow the link to your browser and select the
dashboard and version of your choice.

To check for linting issues and auto-apply fixes where possible run

```
yarn lintfix
```

To build a specific app run

```
yarn build <app-name>  // e.g. fairness, interpret
```

or alternatively `yarn buildall` to build all of them. Since most apps have
dependencies on `mlchartlib` it makes sense to run `yarn buildall` at least
once.

### Testing

#### Run e2e tests locally with mock data

1. git clone <https://github.com/microsoft/responsible-ai-toolbox>
2. `cd responsible-ai-toolbox`
3. `yarn install`
4. `yarn build`
5. To execute tests run `yarn e2eall`. Sometimes it is preferable to watch the execution and select only individual test cases. This is possible using `yarn e2e --watch`.

cypress window will open locally - select test file to run the tests

#### Run e2e tests locally with notebook data

1. git clone <https://github.com/microsoft/responsible-ai-toolbox>
2. `cd responsible-ai-toolbox` (It is recommended to create a new virtual environment and install the dependencies)
3. `yarn install`
4. `yarn buildall` or `yarn build widget`
5. `pip install -e responsibleai` to install responsibleai locally.
6. `pip install -e raiwidgets` to install raiwidgets locally.
7. `pip install jupyter`
8. `cd notebooks\responsibleaidashboard`
9. To execute tests run `yarn e2e-widget`. Sometimes it is preferable to watch the execution and select only individual test cases. This is possible using `yarn e2e-widget --watch`.

Cypress window will open locally - select test file to run the tests.

Since it may take a while to generate and execute all notebooks which makes
the interactive `--watch` mode tedious, there's an option `-n` to specify
individual notebooks. The argument is the notebook name without path and with
`.py` file extension (which is the result of the `.ipynb`-to-`.py`
conversion).

Example: `-n responsibleaidashboard-diabetes-regression-model-debugging.py`

Currently, only a single notebook can be specified.

The notebooks can also be run with flights enabled. For that, simply add your
preferred flights with `-f`.

Example with a single flight `flightName`:
`-f flightName`

Example with multiple flights `f1` and `f2`:
`-n f1,f2`

Furthermore, when iterating on writing such tests it may not be necessary to
regenerate the notebook(s) every single time. To avoid wasting time on this
there's an option `--skipgen` to skip the notebook generation.

#### Test UX and SDK changes

For any new change, which involves changing any of the python SDK components and UI components, the manual testing of the code change can be done using the following steps:

1. git clone <https://github.com/microsoft/responsible-ai-toolbox>
2. `cd responsible-ai-toolbox` (It is recommended to create a new virtual environment and install the dependencies)
3. You should commit all your current set of changes for SDK and UX using `git commit`.
4. Clean all untracked files using `git clean -fdx`
5. Run `yarn install` and `yarn buildall` to build the UX changes.
6. Run `pip install -e responsibleai` to install responsibleai locally.
7. Run `pip install -e raiwidgets` to install raiwidgets locally.
8. Run `pip install -e erroranalysis` to install erroranalysis locally.
9. Run `pip install -e rai_core_flask` to install rai_core_flask locally.
10. Install `jupyter` using `pip install jupyter`
11. Open any notebook using python SDK and any widget from `responsible-ai-toolbox` and test your changes.

The steps from 3 to 11 need to be repeated if you incrementally change UI or SDK.

### Debugging

There are several different ways to debug the dashboards:

1. Use Chrome +
   [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi).
   The debugging experience can be a bit flaky at times, but when it works it
   allows you to set breakpoints and check all variables at runtime.

2. Adding `console.log(...)` statements and check the console during
   execution. Please remember to remove the statements later on.

3. Alternatively, you can set objects as part of `window` to inspect them
   through the console at runtime (as opposed to having to specify what to
   print with `console.log` at compile time).

### Flighting

It is possible to create feature flights to use certain functionality under
development before exposing it to all users immediately.
To do so, go to
`responsible-ai-toolbox\libs\model-assessment\src\lib\ModelAssessmentDashboard\FeatureFlights.ts`
and add your flight.
After that you can use it in Typescript code as follows:

```typescript
isFlightActive(flightName, this.context.featureFlights);
```

To pass the flight into the `ResponsibleAIDashboard`, simply add the keyword
argument `feature_flights` and separate all the flights you wish to pass with
ampersand (`&`), e.g., `feature_flights="flight1&flight2&flight3"`.

In the dashboard test environment (using `yarn start`) you have a dropdown to
select which flights should be active.

### Code approvals

Once you have made your code changes locally, committed them and verified them, you can send a pull request (in short form written as PR) to [responsible-ai-toolbox](https://github.com/microsoft/responsible-ai-toolbox). For more information on how to create a pull request, please see [Proposing changes to your work with pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests).

The PR will need to be approved by at least one code reviewer. In addition, if any changes are made in the listed directories within the [code owners](https://github.com/microsoft/responsible-ai-toolbox/blob/main/CODEOWNERS) file, those owners will be required to approve the PR. You can tag those owners directly in the comments to ensure they are aware of the changes made. Only one code owner is required for an area, but if the PR makes changes in multiple areas at least one code reviewer will be required from each area, hence multiple code reviewers could be required. In general, it is better to make more smaller PRs than fewer larger PRs to make it easier to review the code. Please ensure all automated builds/tests pass on the PR.
