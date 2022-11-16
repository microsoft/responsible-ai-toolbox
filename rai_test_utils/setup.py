# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import setuptools

with open('rai_test_utils/version.py') as f:
    code = compile(f.read(), f.name, 'exec')
    exec(code)

# Fetch ReadMe
with open("README.md", "r") as fh:
    long_description = fh.read()

# Use requirements.txt to set the install_requires
with open('requirements.txt') as f:
    install_requires = [line.strip() for line in f]

setuptools.setup(
    name=name,  # noqa: F821
    version=version,  # noqa: F821
    author="Gaurav Gupta",
    author_email="raiwidgets-maintain@microsoft.com",
    description="Common basic test utilities used across various RAI tools",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/microsoft/responsible-ai-toolbox",
    packages=setuptools.find_packages(),
    python_requires='>=3.6',
    install_requires=install_requires,
    classifiers=[
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Development Status :: 3 - Alpha"
    ]
)
