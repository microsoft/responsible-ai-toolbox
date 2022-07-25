import setuptools


# this must be incremented every time we push an update to pypi (but not before)
VERSION = "0.0.2"

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
    name="nlp_feature_extractors",

    version=VERSION,
    author="",
    author_email="",
    description="NLP Feature Extractors",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/microsoft/error-analysis-nlp",

    # Pckages
    packages=[
        "nlp_feature_extractors",
        "nlp_feature_extractors.data"
    ],

    entry_points={
    },

    # normally, only *.py files are included - this forces our YAML file and
    # controller scripts to be included
    package_data={'': ['*.yaml', '*.sh', '*.bat', '*.txt', '*.rst', '*.crt', '*.json', '*.js', '*.html', '*.css', '*.csv']},
    include_package_data=True,

    # the packages that our package is dependent on
    install_requires=requirements,
    extras_require=dict(
        dev=[
            "sphinx==3.2.1",
            "recommonmark==0.6.0",
            "sphinx-rtd-theme==0.5.0"
        ], ),

    # used to identify the package to various searches
    classifiers=[
        "Programming Language :: Python :: 3",
        "Operating System :: OS Independent",
    ],
)
