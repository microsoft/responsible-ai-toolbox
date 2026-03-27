# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import os
import shutil
import uuid

DOWNLOADED_DATASET_DIR = 'datasets.4.27.2021'


def is_valid_uuid(id: str):
    """Check if the given id is a valid uuid.

    :param id: The id to check.
    :type id: str
    :return: True if the id is a valid uuid, False otherwise.
    :rtype: bool
    """
    try:
        uuid.UUID(str(id))
        return True
    except ValueError:
        return False


def retrieve_dataset(dataset, **kwargs):
    """Retrieve a dataset.

    :param dataset: The dataset to retrieve.
    :type dataset: str
    :return: The dataset.
    :rtype: object
    """
    # if data not extracted, download zip and extract
    outdirname = DOWNLOADED_DATASET_DIR
    if not os.path.exists(outdirname):
        try:
            from urllib import urlretrieve
        except ImportError:
            from urllib.request import urlretrieve
        import zipfile
        zipfilename = outdirname + '.zip'
        urlretrieve(
            'https://publictestdatasets.blob.core.windows.net/data/' +
            zipfilename, zipfilename
        )
        with zipfile.ZipFile(zipfilename, 'r') as unzip:
            unzip.extractall('.')
    extension = os.path.splitext(dataset)[1]
    filepath = os.path.join(outdirname, dataset)
    if extension == '.npz':
        # sparse format file
        from scipy.sparse import load_npz
        in_memory_dataset = load_npz(filepath)
    elif extension == '.svmlight':
        from sklearn import datasets
        in_memory_dataset = datasets.load_svmlight_file(filepath)
    elif extension == '.json':
        import json
        with open(filepath, encoding='utf-8') as f:
            in_memory_dataset = json.load(f)
    elif extension == '.csv':
        import pandas as pd
        in_memory_dataset = pd.read_csv(filepath, **kwargs)
    else:
        raise Exception('Unrecognized file extension: ' + extension)

    shutil.rmtree(outdirname)
    os.remove(zipfilename)

    return in_memory_dataset
