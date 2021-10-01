# Copyright (c) Microsoft Corporation
# Licensed under the MIT license.

import setuptools


# The version must be incremented every time we push an update to pypi (but
# not before)
VERSION = "0.2.4"

# supply contents of our README file as our package's long description
with open("README.md", "r") as fh:
    long_description = fh.read()


requirements = []
with open("requirements.txt", "r") as fr:
    requirements = list(filter(
        lambda rq: rq != "",
        map(lambda r: r.strip(), fr.read().split("\n"))))


setuptools.setup(
    # this is the name people will use to "pip install" the package
    name="rai_core_flask",

    version=VERSION,
    author="Roman Lutz, Ke Xu, Xavier Fernandes",
    author_email="raiwidgets-maintain@microsoft.com",
    description="Responsible AI Core Flask Wrapper",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="",
    # this will find our package "xtlib" by its having an "__init__.py" file
    packages=setuptools.find_packages(),
    entry_points={},
    # normally, only *.py files are included - this forces our YAML file and
    # controller scripts to be included
    package_data={'': []},
    include_package_data=True,
    # the packages that our package is dependent on
    install_requires=requirements,
    extras_require=dict(
        dev=[
        ], ),
    # used to identify the package to various searches
    classifiers=[
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
)
