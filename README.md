# Responsible AI Core

This project provides responsible AI user interfaces for
[Fairlearn](https://fairlearn.github.io) and
[interpret-community](https://interpret.ml), as well as foundational building
blocks that they rely on.

These include

- a shared service layer which also maintains utilities to
  determine the environment that it is running in so that it can configure the
  local flask service accordingly.
- a base typescript library with common controls used across responsible AI
  dashboards

## Contributing

### Contributor license agreement

This project welcomes contributions and suggestions. Most contributions
require you to agree to a Contributor License Agreement (CLA) declaring that
you have the right to, and actually do, grant us the rights to use your
contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether
you need to provide a CLA and decorate the PR appropriately (e.g., status
check, comment). Simply follow the instructions provided by the bot. You will
only need to do this once across all repos using our CLA.

If you have previously committed changes that were not signed follow
[these steps](https://dev.to/jrushlow/oops-i-forgot-to-sign-my-commit-from-last-monday-2jke)
to sign them retroactively after setting up your GPG key as described in the
[GitHub documentation](https://docs.github.com/en/github/authenticating-to-github/managing-commit-signature-verification).

### Code of conduct

This project has adopted the
[Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the
[Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any
additional questions or comments.

### Development process

For all further steps `yarn install` is a prerequisite.

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
dashboard of your choice.

To check for linting issues and auto-apply fixes where possible run

```
yarn lintfix
```

To build a specific app run

```
yarn build <app-name>  // e.g. fairlearn, interpret
```

or alternatively `yarn buildall` to build all of them. Since most apps have
dependencies on `mlchartlib` it makes sense to run `yarn buildall` at least
once.

#### Debugging

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
