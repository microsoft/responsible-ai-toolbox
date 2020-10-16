# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Setup file for error-analysis package."""
from setuptools import setup, find_packages
import os
import shutil

_major = '0'
_minor = '0'
_patch = '0'

README_FILE = 'README.md'
LICENSE_FILE = 'LICENSE.txt'

# Note: used when generating the wheel but not on pip install of the package
if os.path.exists('../LICENSE'):
    shutil.copyfile('../LICENSE', LICENSE_FILE)

VERSION = '{}.{}.{}'.format(_major, _minor, _patch)


CLASSIFIERS = [
    'Development Status :: 5 - Production/Stable',
    'Intended Audience :: Developers',
    'Intended Audience :: Science/Research',
    'License :: OSI Approved :: MIT License',
    'Programming Language :: Python :: 3',
    'Programming Language :: Python :: 3.5',
    'Programming Language :: Python :: 3.6',
    'Programming Language :: Python :: 3.7',
    'Topic :: Scientific/Engineering :: Artificial Intelligence',
    'Operating System :: Microsoft :: Windows',
    'Operating System :: MacOS',
    'Operating System :: POSIX :: Linux'
]

DEPENDENCIES = [
    'numpy',
    'pandas',
    'scipy',
    'scikit-learn',
    'packaging'
]

EXTRAS = {
    'visualization': [
        'flask',
        "flask-cors",
        "gevent>=1.3.6",
        "jinja2"
    ]
}

with open(README_FILE, 'r', encoding='utf-8') as f:
    README = f.read()

setup(
    name='error-analysis',

    version=VERSION,

    description='Microsoft Interpret Extensions SDK for Python',
    long_description=README,
    long_description_content_type='text/markdown',
    author='Microsoft Corp',
    author_email='ilmat@microsoft.com',
    license='MIT License',
    url='https://github.com/interpretml/error-analysis',

    classifiers=CLASSIFIERS,

    packages=find_packages(exclude=["*.tests"]),

    install_requires=DEPENDENCIES,
    include_package_data=True,
    package_data={
        '': [
            'error_analysis/widget/templates/inlineDashboard.html',
            'error_analysis/widget/static/index.js',
            'error_analysis/widget/static/index.js.map'
        ]
    },
    zip_safe=False,
    extras_require=EXTRAS
)
