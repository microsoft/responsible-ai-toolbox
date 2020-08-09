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

### Code of conduct

This project has adopted the
[Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the
[Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any
additional questions or comments.

### Development process

To run the dashboards locally use

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
