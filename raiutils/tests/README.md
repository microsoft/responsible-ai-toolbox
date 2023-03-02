For running unit tests for `raiutils` locally with your changes, you would need an editable install of `raiutils`. From the top level directory you can install an editable version of `raiutils` using the following command:-

```
pip install -e raiutils
```

If you are in the `raiutils` directory, then the folllowing command will install an editable version of `raiutils`:-

```
pip install -e .
```

You would also need to install the test dependencies defined in file `raiutils/requirements-dev.txt`. 

```
pip install -r requirements-dev.txt
```

For running the unit tests, you may do the following:-

```
cd tests
pytest .
```
