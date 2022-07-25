# Project

The Error Analysis NLP project enables the Error Analysis Tool to be applied to Natural Language Processing (NLP)
tasks on unstructured text.

## Setup

The project was developed and tested on Linux (Ubuntu 18.04).

1. Create a virtual environment `python3 -m venv .venv`.
2. Activate the environment `source .venv/bin/activate`
3. Upgrade pip `pip install pip --upgrade`.
4. From the project root run `pip install -e .`
5. Download a language pack for Spacy `python -m spacy download en_core_web_sm`
6. Set the environment variable `AZURE_STORAGE_CONNECTION_STRING` to the connection string for the `erroranalysisnlp` Azure Storage account.
7. To run the notebooks make sure that (3) has been set. Then start a Jupyter Notebook server from within the `notebooks` folder.

## Notes

1. The Amulet scripts were used to run inference on GCR.
2. The feature extrction was performed at the same time, and the results of the feature extraction and inference were stored as a single JSON blob.
3. The datasets created in (2) were large enough that we had to opt to store them in Azure Blob Storage instead of checking them into the repository.
4. The notebooks that demonstrate the application of the Error Analysis tool to NLP tasks, load these datasets directly from Azure Blob Storage.


## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft 
trademarks or logos is subject to and must follow 
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.

## Installation

- Setup a Python virtual environment `python3 -m venv nlp-venv`
- Activate the environment `source nlp-venv/bin/activate`
- Clone the repo. This should clone the repo to a folder `error-analysis-nlp`
- From within the `error-analysis-nlp` folder do `pip install -e .`
- You may optionally specify the pip cache folder above by using the attribute `--cache-dir <path-to-pip-cache>`
- Once setup change into the folder `error-analysis-nlp/notebooks` and run `jupyter-notebook`
- Optionally, you may set the environment variables that specify the Huggingface caches for models and datasets, respectively `TRANSFORMERS_CACHE` and `HF_DATASETS_CACHE`.

