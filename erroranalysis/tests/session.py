# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

try:
    spark_installed = True
    import pyspark
except ImportError:
    spark_installed = False


def setup_session():
    if not spark_installed:
        return None
    app = pyspark.sql.SparkSession.builder.appName(
        "erroranalysis-tests").master("local[2]")
    spark = app.config(
        "spark.jars.packages",
        "com.microsoft.azure:synapseml_2.12:1.1.3").config(
        "spark.jars.repositories",
        "https://mmlspark.blob.core.windows.net/maven").getOrCreate()
    return spark
