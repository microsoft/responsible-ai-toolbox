# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import builtins

from erroranalysis._internal import utils


def test_pyspark_numpy_import_error_disables_spark(monkeypatch):
    original_import = builtins.__import__

    def import_with_incompatible_pyspark(name, *args, **kwargs):
        if name == "pyspark.pandas":
            raise AttributeError("np.NaN was removed in NumPy 2.0")
        return original_import(name, *args, **kwargs)

    monkeypatch.setattr(builtins, "__import__",
                        import_with_incompatible_pyspark)

    assert utils._load_pyspark_pandas() is None
