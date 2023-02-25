For running unit tests for `raiwidgets` locally with your changes, you would need an editable install of `raiwidgets`. From the top level directory you can install an editable version of `raiwidgets` using the following command:-

```
pip install -e raiwidgets
```

If you are in the `raiwidgets` directory, then the folllowing command will install an editable version of `raiwidgets`:-

```
pip install -e .
```

You would also need to install the test dependencies defined in file `raiwidgets/requirements-dev.txt`. 

```
pip install -r requirements-dev.txt
```

You need to compile and build the javascript/typescript code to create widgets binary. You can do this using the following commands:-
```
yarn install
yarn buildall
```  

For running the unit tests, you may do the following:-

```
cd tests
pytest .
```
