# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import os
import urllib

import numpy as np
import pandas as pd
import pytest

try:
    spark_installed = True

    from session import setup_session
    spark = setup_session()

    from pyspark.ml import Pipeline
    from pyspark.ml.classification import LogisticRegression
    from pyspark.ml.feature import StringIndexer, VectorAssembler
except ImportError:
    spark_installed = False

from test_surrogate_error_tree import run_error_analyzer

from erroranalysis._internal.constants import ModelTask


class TestPysparkSurrogateErrorTree(object):
    @pytest.mark.skipif(not spark_installed, reason="requires pyspark")
    def test_surrogate_error_tree_adult_census_income(self):
        dataFile = "AdultCensusIncome.csv"
        if not os.path.isfile(dataFile):
            mmlspark_url = "https://mmlspark.azureedge.net/datasets/"
            urllib.request.urlretrieve(mmlspark_url + dataFile, dataFile)
        data = spark.createDataFrame(
            pd.read_csv(dataFile, dtype={" hours-per-week": np.float64}))

        feature_names = [" education-num", " capital-gain", " hours-per-week"]
        label_col = " income"
        data = data.select(feature_names + [label_col])
        train, test = data.randomSplit([0.75, 0.25], seed=123)

        assembler = VectorAssembler().setInputCols(
            feature_names).setOutputCol("features")

        indexed_label_col = "income indexed"
        indexer = StringIndexer(inputCol=label_col,
                                outputCol=indexed_label_col)
        lr = LogisticRegression(labelCol=indexed_label_col)

        pipeline = Pipeline(stages=[assembler, indexer, lr])

        pipeline_model = pipeline.fit(train)
        categorical_features = []
        model_task = ModelTask.CLASSIFICATION
        run_error_analyzer(pipeline_model, test.to_koalas(),
                           indexed_label_col, feature_names,
                           categorical_features,
                           model_task=model_task)
