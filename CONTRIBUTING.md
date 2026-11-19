# Contributing

## Contributor license agreement

This project welcomes contributions and suggestions. Most contributions
require you to agree to a Contributor License Agreement (CLA) declaring that
you have the right to, and actually do, grant us the rights to use your
contribution. For details, visit <https://cla.opensource.microsoft.com>.

Before contributing, please check that you have the correct configurations of
(1) Contributor License Agreement and (2) GPG key.

(1) Contributor License Agreement
When you submit a pull request, a CLA bot will automatically determine whether
you need to provide a CLA and decorate the PR appropriately (e.g., status
check, comment). Simply follow the instructions provided by the bot. You will
only need to do this once across all repos using our CLA.

(2) GPG Key

Setting up a GPG key has three stages:

1. [Generate the key](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/generating-a-new-gpg-key)
1. [Tell GitHub about the key](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/adding-a-new-gpg-key-to-your-github-account)
1. [Instruct Git to sign using your key](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/telling-git-about-your-signing-key)

Note that the `GitBash` shell installed by Git on Windows already has GPG
installed, so there is no need to install GPG separately.

Please also make sure to set email in git config (git config --global user.email "MY_NAME@example.com") which should be the same email linked to the PGP Key.

If you have previously committed changes that were not signed follow
[these steps](https://dev.to/jrushlow/oops-i-forgot-to-sign-my-commit-from-last-monday-2jke)
to sign them retroactively after setting up your GPG key as described in the
[GitHub documentation](https://docs.github.com/en/github/authenticating-to-github/managing-commit-signature-verification).

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

This repository is tested with node 14.x, 15.x and 16.x, so using the latest 16.x version is recommended.

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

### Linting

To check for linting issues and auto-apply fixes where possible run

```
yarn lintfix
```

You could also use [prettier](https://prettier.io/docs/en/install.html) to lint your files. Once you have installed prettier using `yarn`, you could use `yarn prettier --write .` to lint files in a particular directory.

### Building

To build a specific app run

```
yarn build <app-name>  // e.g. fairness, interpret
```

or alternatively `yarn buildall` to build all of them. Since most apps have
dependencies on `mlchartlib` it makes sense to run `yarn buildall` at least
once.

### Testing

#### Python dependency compatibility

Runtime requirements describe broad supported dependency ranges, not a Docker
image lockfile. Keep reproducible version selections in CI constraints or the
consuming image's environment definition. Retain runtime bounds for known
incompatibilities; do not raise all runtime floors just to select a NumPy 2
test environment.

The NumPy compatibility workflow exercises a Python 3.9 legacy stack
(NumPy 1.23.5, Pandas 1.5.3, DiCE 0.11, EconML 0.15.1), Pandas 1.5.3 with
newer dependencies, and NumPy 1.x/2.x with the newer stack. Its NumPy 2
baseline uses Pandas 2.2.2 and DiCE 0.12. These are compatible combinations,
not a guarantee that every cross-product of the runtime ranges works.
In particular, DiCE 0.11 requires Pandas below 2, and older Pandas wheels
must remain on NumPy 1 even when their metadata omits that upper bound.
Keep those versions together in downstream Docker constraints.

Fairlearn remains at least 0.8 because older reductions use APIs removed in
Pandas 2. ResponsibleAI caps LightGBM below 4.6 because its stricter feature
validation breaks EconML causal AutoML projections. Interpret Community's
own requirements select compatible SHAP, Interpret Core, and ml-wrappers
versions; avoid overriding that selection with unconditional exact pins.

#### Run e2e tests locally with mock data

1. git clone <https://github.com/microsoft/responsible-ai-toolbox>
2. `cd responsible-ai-toolbox`
3. `yarn install`
4. `yarn build`
5. To execute tests run `yarn e2e`. Sometimes it is preferable to watch the execution and select only individual test cases. This is possible using `yarn e2e --watch`.

cypress window will open locally - select test file to run the tests

#### Run e2e tests locally with notebook data

1. git clone <https://github.com/microsoft/responsible-ai-toolbox>
2. `cd responsible-ai-toolbox` (It is recommended to create a new virtual environment and install the dependencies)
3. `yarn install`
4. `yarn buildall` or `yarn build widget`
5. `pip install -e responsibleai_vision` if using the RAI Vision Dashboard locally.
6. `pip install -e responsibleai_text` if using the RAI Text Dashboard locally.
7. `pip install -e raiwidgets` to install raiwidgets locally.
8. `pip install -e responsibleai` to install responsibleai locally.

   If there are changes to other python packages, you will want to install them locally as well:

   `pip install -e raiutils`

   `pip install -e erroranalysis`

   `pip install -e rai_core_flask`

   `pip install -e nlp_feature_extractors` if using the RAI Text Dashboard locally.

   If there are no changes to them, then raiwidgets install will pick up the latest versions released on pypi.

9. `pip install jupyter`
10. `cd notebooks\responsibleaidashboard`
11. To execute tests run `yarn e2e-widget`. Sometimes it is preferable to watch the execution and select only individual test cases. This is possible by running the notebook manually and using `yarn e2e-widget -w --host {host} -n {notebook}` where host is where RAI widget runs on (printed in notebook output) and notebook is the name of the notebook you are running. Eg: `yarn e2e-widget -w --host 8704 -n responsibleaidashboard-census-classification-model-debugging`

Cypress window will open locally - select test file to run the tests.

Since it may take a while to generate and execute all notebooks which makes
the interactive `--watch` mode tedious, there's an option `-n` to specify
individual notebooks. The argument is the notebook name without path.

Example: `-n responsibleaidashboard-diabetes-regression-model-debugging`

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
6. Run `pip install -e responsibleai_vision` if using the RAI Vision Dashboard locally.
7. Run `pip install -e responsibleai_text` if using the RAI Text Dashboard locally.
8. Run `pip install -e raiwidgets` to install raiwidgets locally.
9. Run `pip install -e responsibleai` to install responsibleai locally.
10. Run `pip install -e erroranalysis` to install erroranalysis locally.
11. Run `pip install -e rai_core_flask` to install rai_core_flask locally.
12. Run `pip install -e raiutils` to install raiutils locally.
13. Run `pip install -e nlp_feature_extractors` to install nlp_feature_extractors locally if using the RAI Text Dashboard.
14. Run `pip install -e rai_test_utils` to install rai_test_utils locally.
15. Install `jupyter` using `pip install jupyter`
16. Open any notebook using python SDK and any widget from `responsible-ai-toolbox` and test your changes.

The steps from 3 to 14 need to be repeated if you incrementally change UI or SDK.

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

## npm publishing

The npm publishing jobs in `release-rai-tabular.yml` and `CD.yml` use
[npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) through
GitHub Actions OIDC, rather than a stored `NPM_TOKEN`. The publishing jobs
use GitHub-hosted runners, grant `id-token: write`, and install a pinned npm
11 version with OIDC support. Keep Node at least 22.14.0 and npm at least
11.5.1 when updating these jobs. Each package's `repository` metadata must
continue to identify this GitHub repository for publishing and provenance.

### One-time migration checklist

Coordinate this migration with the next production release. Do not merge
the OIDC workflow change before the npm-side configuration below is ready:
merging to `main` triggers the CD publisher immediately.

1. As an authorized npm package administrator, open each package's settings
   and add **two** GitHub Actions trusted publishers, one per workflow.
   Use organization **microsoft**, repository **responsible-ai-toolbox**,
   and workflow filenames **release-rai-tabular.yml** and **CD.yml**
   (case-sensitive filenames only, not `.github/workflows/` paths).
   Leave the environment name blank because these jobs do not use a
   GitHub environment. Explicitly allow **direct publishing (`npm publish`)**;
   the default stage-only permission does not permit these workflows.
2. Apply this configuration to all 14 packages under `@responsible-ai`:
   `core-ui`, `forecasting`, `mlchartlib`, `dataset-explorer`, `causality`,
   `counterfactuals`, `fairness`, `interpret`, `interpret-text`,
   `interpret-vision`, `localization`, `error-analysis`, `model-assessment`,
   and `e2e`.
3. Merge the workflow change and verify that CD publishes successfully.
   Run the next production release from `main` with a **new version** and
   verify all 14 npm publishing jobs. Each newly configured publisher must
   complete its first real publication within **two days** of configuration;
   CD does not validate the separate release-workflow publisher.
   An expired configuration must be deleted and recreated.
4. After both workflows have published successfully through OIDC, revoke
   the old npm automation token and remove the GitHub `NPM_TOKEN` secret
   once no other workflows or repositories depend on that credential.
   Package administrators can then require 2FA and disallow traditional
   publishing tokens in npm package settings; OIDC continues to work.

### Release checks and recovery

The release workflow still requires a maintainer to dispatch it. A `Test`
release publishes Python packages to TestPyPI but only **dry-runs** npm.
It does not prove that npm trusted publishing is configured correctly or
validate a new publisher. A `Prod` release publishes npm packages
automatically after the existing unit and notebook tests pass.
Both publishers set their existing `latest` dist-tag explicitly because
npm 11 requires an explicit tag for CD prereleases and for maintenance
releases below an already-published stable version.

Verify publication with `npm view @responsible-ai/<package>@<version> version`
for each package, rather than relying only on the action's summary message.

The existing npm action skips versions already published, so retry only
failed publishing jobs from the original run after correcting a failure;
do not rerun successful PyPI uploads or recreate the version tag. The npm
matrix does not cancel other packages when one package fails.

OIDC removes manual npm-token rotation, not all failure modes. Missing or
expired trust configurations, a mismatched workflow filename or repository,
registry outages, and genuine build/test failures still fail visibly.

### Code approvals

Once you have made your code changes locally, committed them and verified them, you can send a pull request (in short form written as PR) to [responsible-ai-toolbox](https://github.com/microsoft/responsible-ai-toolbox). For more information on how to create a pull request, please see [Proposing changes to your work with pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests).

The PR will need to be approved by at least one code reviewer. In addition, if any changes are made in the listed directories within the [code owners](https://github.com/microsoft/responsible-ai-toolbox/blob/main/CODEOWNERS) file, those owners will be required to approve the PR. You can tag those owners directly in the comments to ensure they are aware of the changes made. Only one code owner is required for an area, but if the PR makes changes in multiple areas at least one code reviewer will be required from each area, hence multiple code reviewers could be required. In general, it is better to make more smaller PRs than fewer larger PRs to make it easier to review the code. Please ensure all automated builds/tests pass on the PR.
