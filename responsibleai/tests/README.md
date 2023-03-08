For running unit tests for `responsibleai` locally with your changes, you would need an editable install of responsibleai. From the top level directory you can install an editable version of `responsibleai` using the following command:-

```
pip install -e responsibleai
```

If you are in the `responsibleai` directory, then the folllowing command will install an editable version of `responsibleai`:-

```
pip install -e .
```

You would also need to install the test dependencies defined in file `responsibleai/requirements-dev.txt`. 

```
pip install -r requirements-dev.txt
```

For running the unit tests, you may do the following:-

```
cd tests
pytest .
```

Some of the utilities used in `responsibleai` tests are hosted under the pypi package `rai_test_utils`. This source code for `rai_test_utils` is available at https://github.com/microsoft/responsible-ai-toolbox/tree/main/rai_test_utils. 
