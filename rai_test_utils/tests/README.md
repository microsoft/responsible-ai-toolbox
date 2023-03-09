For running unit tests for `rai_test_utils` locally with your changes, you would need an editable install of `rai_test_utils`. From the top level directory you can install an editable version of `rai_test_utils` using the following command:-

```
pip install -e rai_test_utils
```

If you are in the `rai_test_utils` directory, then the folllowing command will install an editable version of `rai_test_utils`:-

```
pip install -e .
```

You would also need to install the test dependencies defined in file `rai_test_utils/requirements-dev.txt`. 

```
pip install -r requirements-dev.txt
```

For running the unit tests, you may do the following:-

```
cd tests
pytest .
```
