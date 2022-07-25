# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

#!/bin/sh

# Install the Python dependencies and the package itself
python -m pip install -r requirements.txt
python -m pip install setuptools wheel twine keyring artifacts-keyring
python -m pip install -e .

# Remove previous build folders
rm -rf dist
rm -rf build
rm -rf backwardcompatibilityml.egg-info

# Build source dist (*.tar.gz) and wheel (*.whl)
python setup.py sdist bdist_wheel

# Publish the package to Pypi
python -m twine upload dist/*