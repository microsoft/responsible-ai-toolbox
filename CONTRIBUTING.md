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

1. git clone <https://github.com/microsoft/responsible-ai-widget>
2. `cd responsible-ai-toolbox`
3. `yarn install`
4. `yarn build`
5. To execute tests run `yarn e2eall`. Sometimes it is preferable to watch the execution and select only individual test cases. This is possible using `yarn e2e --watch`

cypress window will open locally - select test file to run the tests

#### Run e2e tests locally with notebook data

1. git clone <https://github.com/microsoft/responsible-ai-widget>
2. `cd responsible-ai-toolbox` (It is recommended to create a new virtual environment and install the dependencies)
3. `yarn install`
4. `yarn buildall` or `yarn build widget`
5. `pip install -e responsibleai` to install responsibleai locally.
6. `pip install -e raiwidgets` to install raiwidgets locally.
7. `pip install jupyter`
8. `cd notebooks\responsibleaitoolbox-dashboard`
9. To execute tests run `yarn e2e-widget`. Sometimes it is preferable to watch the execution and select only individual test cases. This is possible using `yarn e2e-widget --watch`

cypress window will open locally - select test file to run the tests

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
