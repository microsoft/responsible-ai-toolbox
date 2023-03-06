For running unit tests for `erroranalysis` locally with your changes, you would need an editable install of erroranalysis. From the top level directory you can install an editable version of `erroranalysis` using the following command:-

```
pip install -e erroranalysis
```

If you are in the `erroranalysis` directory, then the folllowing command will install an editable version of `erroranalysis`:-

```
pip install -e .
```

You would also need to install the test dependencies defined in file `erroranalysis/requirements-dev.txt`. 

```
pip install -r requirements-dev.txt
```

For running the unit tests, you may do the following:-

```
cd tests
pytest .
```

Some of the utilities used in `erroranalysis` tests are hosted under the pypi package `rai_test_utils`. This source code for `rai_test_utils` is available at https://github.com/microsoft/responsible-ai-toolbox/tree/main/rai_test_utils. 
