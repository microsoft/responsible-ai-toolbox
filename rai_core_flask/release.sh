python -m pip install --user --upgrade setuptools wheel twine

# Remove previous build folders
rm -rf dist
rm -rf build
rm -rf rai_core_flask.egg-info

# build
python setup.py sdist bdist_wheel

# upload to Pypy
python -m twine upload dist/*
