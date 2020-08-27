# Copyright (c) Microsoft Corporation and contributors.
# Licensed under the MIT License.

import setuptools
import fairlearnboard

# Fetch ReadMe
with open("README.md", "r") as fh:
    long_description = fh.read()

# Use requirements.txt to set the install_requires
with open('requirements.txt') as f:
    install_requires = [line.strip() for line in f]

setuptools.setup(
    name=fairlearnboard.__name__,
    version=fairlearnboard.__version__,
    author="Roman Lutz, Ke Xu, Brandon Horn",
    author_email="fairlearn@microsoft.com",
    description="Interactive visualizations to assess fairness in Machine Learning",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/microsoft/responsible-ai-core",
    packages=setuptools.find_packages(),
    python_requires='>=3.6',
    install_requires=install_requires,
    classifiers=[
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Development Status :: 3 - Alpha"
    ],
    include_package_data=True,
    data_files=[
        ('share/jupyter/nbextensions/fairlearn-widget', [
            'fairlearnboard/static/extension.js',
            'fairlearnboard/static/extension.js.map',
            'fairlearnboard/static/index.js',
            'fairlearnboard/static/index.js.map'
        ]),
        ("etc/jupyter/nbconfig/notebook.d", [
            "jupyter-config/nbconfig/notebook.d/fairlearn-widget.json"
        ]),
        ('share/jupyter/lab/extensions', [
            'fairlearnboard/js/'
            'fairlearn_widget/labextension/fairlearn-widget-0.1.0.tgz'
        ])],
    zip_safe=False,
)
