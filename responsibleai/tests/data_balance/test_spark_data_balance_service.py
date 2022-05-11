# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from responsibleai._tools.data_balance.spark_data_balance_service import (
    SparkDataBalanceService,
)

try:
    import pyspark.sql.types as T
except ImportError:
    pass


class TestSparkDataBalance:
    # TODO: Get working with pyspark.
    def test_prepare_df_with_empty_df(self):
        columns = T.StructType([])
        empty_df = spark.createDataFrame(data=[], schema=columns)
        output = SparkDataBalanceService.prepare_df(
            df=empty_df, target_column=None, pos_label=None
        )
        assert output.empty
        assert empty_df.equals(output)
        assert empty_df is not output
