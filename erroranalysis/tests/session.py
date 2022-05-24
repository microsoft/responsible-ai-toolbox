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
    app = pyspark.sql.SparkSession.builder.appName("MyApp")
    spark = app.config(
        "spark.jars.packages",
        "com.microsoft.azure:synapseml_2.12:0.9.5").getOrCreate()
    return spark
