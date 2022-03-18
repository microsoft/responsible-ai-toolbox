# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import zipfile

import pandas as pd
import pytest

from raiutils.dataset import fetch_dataset


class TestFetchDataset(object):

    def test_fetch_dataset(self):
        outdirname = 'responsibleai.12.28.21'
        zipfilename = outdirname + '.zip'
        data = 'https://publictestdatasets.blob.core.windows.net/data/'
        url = data + zipfilename
        fetch_dataset(url, zipfilename)
        with zipfile.ZipFile(zipfilename, 'r') as unzip:
            unzip.extractall('.')

        train_data = pd.read_csv('adult-train.csv')
        assert train_data.shape[0] == 32561
        assert train_data.shape[1] == 15

    def test_fetch_bad_url(self):
        url = 'https://publictestdatasets.blob.core.windows.net/data/bad.zip'
        with pytest.raises(RuntimeError):
            fetch_dataset(url, 'bad_url.zip', max_retries=2, retry_delay=1)
