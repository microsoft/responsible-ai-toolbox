# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest

try:
    spark_installed = True

    from session import setup_session
    spark = setup_session()

    from pyspark.ml.feature import VectorAssembler
    from pyspark.sql import functions as F
    from synapse.ml.lightgbm import LightGBMClassifier
except ImportError:
    spark_installed = False

from test_surrogate_error_tree import (ERROR, ID, PARENTID, SIZE,
                                       validate_error_tree)

from erroranalysis._internal.constants import ModelTask
from erroranalysis.analyzer import ModelAnalyzer


class TestPysparkSurrogateErrorTree(object):
    @pytest.mark.skipif(not spark_installed, reason="requires pyspark")
    def test_synapseml_lightgbm_surrogate_error_tree(self):
        feature_names = ["feature_1", "feature_2"]
        label_col = "label"
        data = spark.createDataFrame([
            (0.0, 0.0, 0.0),
            (0.0, 1.0, 0.0),
            (1.0, 0.0, 1.0),
            (1.0, 1.0, 1.0),
            (2.0, 0.0, 1.0),
            (2.0, 1.0, 1.0),
            (3.0, 0.0, 0.0),
            (3.0, 1.0, 0.0),
        ], feature_names + [label_col])
        assembler = VectorAssembler(
            inputCols=feature_names,
            outputCol="features")
        assembled = assembler.transform(data)
        model = LightGBMClassifier(
            featuresCol="features",
            labelCol=label_col,
            numIterations=2,
            numLeaves=4,
            minDataInLeaf=1).fit(assembled)
        evaluation_data = data.withColumn(
            label_col,
            F.when(
                F.col("feature_1") >= 2,
                1 - F.col(label_col)).otherwise(F.col(label_col)))
        evaluation_assembled = assembler.transform(evaluation_data)
        dataset = evaluation_assembled.select(
            feature_names + ["features", label_col]).pandas_api()
        analyzer = ModelAnalyzer(
            model,
            dataset,
            label_col,
            feature_names,
            [],
            model_task=ModelTask.CLASSIFICATION)

        tree = analyzer.compute_error_tree(
            feature_names,
            None,
            None,
            max_depth=2,
            num_leaves=4,
            min_child_samples=1)

        validate_error_tree(
            tree,
            len(evaluation_data.collect()),
            min_child_samples=1,
            is_regression=False)
        parent_ids = {
            node[PARENTID] for node in tree if node[PARENTID] is not None}
        leaves = [node for node in tree if node[ID] not in parent_ids]
        assert len(tree) > 1
        assert tree[0][ERROR] == 4
        assert sum(node[ERROR] for node in leaves) == tree[0][ERROR]
        assert sum(node[SIZE] for node in leaves) == tree[0][SIZE]
        assert any(node[ERROR] == 0 for node in leaves)
