# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import datetime
import math
import numbers
import random
import re
from decimal import Decimal

import numpy as np
import pandas as pd

try:
    import pyspark.pandas as ps
    spark_available = True
except ImportError:
    spark_available = False
    pass


class _ArrowTemporalScalar:
    """Store a raw Arrow temporal value without bounded Python conversion."""
    def __init__(self, key):
        self.key = key


def coerce_integer_array(values):
    """Return an integer array without losing Python or extension integers."""
    if type(values).__module__.startswith("pyarrow") and hasattr(
            values, "to_pylist"):
        type_name = str(values.type)
        if not type_name.startswith(("int", "uint")):
            return None
        if getattr(values, "null_count", 0):
            return None
        values = values.to_pylist()
    dtype = getattr(values, "dtype", None)
    if isinstance(dtype, pd.SparseDtype):
        if not pd.api.types.is_integer_dtype(dtype.subtype):
            return None
        if np.asarray(pd.isna(values), dtype=bool).any():
            return None
        numpy_dtype = getattr(dtype.subtype, "numpy_dtype", dtype.subtype)
        if pd.api.types.is_extension_array_dtype(dtype.subtype):
            return np.asarray(list(values), dtype=numpy_dtype)
        if hasattr(values, "sparse"):
            values = values.sparse.to_dense()
        else:
            values = values.to_dense()
        return np.asarray(values, dtype=numpy_dtype)
    numpy_dtype = getattr(dtype, "numpy_dtype", None)
    if (dtype is not None and numpy_dtype is not None and
            np.issubdtype(np.dtype(numpy_dtype), np.integer) and
            not np.issubdtype(np.dtype(numpy_dtype), np.datetime64) and
            not np.issubdtype(np.dtype(numpy_dtype), np.timedelta64)):
        if np.asarray(pd.isna(values), dtype=bool).any():
            return None
        return values.to_numpy(dtype=numpy_dtype)
    try:
        array = np.asarray(values)
    except ValueError:
        return None
    if np.issubdtype(array.dtype, np.integer):
        return array
    if array.dtype != object and hasattr(values, "dtype"):
        return None
    try:
        object_array = (array if array.dtype == object else
                        np.asarray(values, dtype=object))
    except ValueError:
        return None
    if (object_array.size > 0 and
            pd.api.types.infer_dtype(
                object_array.ravel(), skipna=False) == "integer"):
        return np.frompyfunc(int, 1, 1)(object_array)
    return None


def compute_integer_residuals(predictions, labels):
    """Subtract arrays already known to contain only integer values."""
    prediction_size = (8 if predictions.dtype == object
                       else predictions.dtype.itemsize)
    label_size = 8 if labels.dtype == object else labels.dtype.itemsize
    size = max(prediction_size, label_size)
    signed_dtype = object if size == 8 else np.int64
    predictions = predictions.astype(signed_dtype)
    labels = labels.astype(signed_dtype)
    return predictions - labels


def normalize_single_output_array(values):
    """Return an array with a single-output column vector flattened."""
    dtype = getattr(values, "dtype", None)
    array = None
    if (isinstance(values, pd.Categorical) or
            pd.api.types.is_categorical_dtype(dtype)):
        categorical = (values if isinstance(values, pd.Categorical)
                       else values.array)
        categories = normalize_single_output_array(
            categorical.categories.array)
        codes = np.asarray(categorical.codes)
        array = np.empty(codes.shape, dtype=object)
        missing = codes == -1
        array[missing] = None
        valid_indexes = np.flatnonzero(~missing)
        if categories.dtype.kind in ("M", "m"):
            for index in valid_indexes:
                array[index] = categories[codes[index]]
        else:
            array[~missing] = categories[codes[~missing]]
        integers = None
    else:
        integers = coerce_integer_array(values)
    if integers is not None:
        array = integers
    elif array is not None:
        pass
    elif type(values).__module__.startswith("pyarrow") and hasattr(
            values, "to_pylist"):
        type_name = str(values.type)
        if type_name.startswith("dictionary<"):
            return normalize_single_output_array(
                values.cast(values.type.value_type))
        temporal_kind = next((
            kind for prefix, kind in (
                ("timestamp[", "datetime"),
                ("duration[", "timedelta"),
                ("time32[", "time-naive"),
                ("time64[", "time-naive"),
                ("date32[", "datetime"),
                ("date64[", "datetime"),
            ) if type_name.startswith(prefix)), None)
        if temporal_kind is not None:
            import pyarrow as pa
            if type_name.startswith("date32["):
                unit = "D"
            elif type_name.startswith("date64["):
                unit = "ms"
            else:
                unit = type_name[type_name.index("[") + 1:].split(
                    ",", 1)[0].rstrip("]")
            factors = {
                "D": 86400 * 10 ** 18,
                "s": 10 ** 18, "ms": 10 ** 15,
                "us": 10 ** 12, "ns": 10 ** 9,
            }
            integer_type = pa.int32() if type_name.startswith(
                ("time32[", "date32[")) else pa.int64()
            epoch_attoseconds = (
                datetime.date(1970, 1, 1).toordinal() *
                86400 * 10 ** 18)

            def temporal_key(value):
                attoseconds = int(value) * factors[unit]
                if temporal_kind == "datetime":
                    if "tz=" in type_name:
                        return (
                            "datetime-instant",
                            epoch_attoseconds + attoseconds)
                    return (
                        "datetime",
                        epoch_attoseconds + attoseconds,
                        "")
                return (temporal_kind, attoseconds)

            array = np.asarray([
                None if value is None else
                _ArrowTemporalScalar(temporal_key(value))
                for value in values.cast(integer_type).to_pylist()
            ], dtype=object)
        elif (getattr(values, "null_count", 0) and
              type_name.startswith(("double", "float", "halffloat"))):
            array = np.asarray(values)
        else:
            array = np.asarray(values.to_pylist(), dtype=object)
    elif ((hasattr(values, "array") and
           type(values.array).__module__.startswith(
               "pandas.core.arrays.arrow")) or
          type(values).__module__.startswith("pandas.core.arrays.arrow")):
        arrow_values = values.array if hasattr(values, "array") else values
        array = normalize_single_output_array(
            arrow_values.__arrow_array__())
    elif isinstance(values, (pd.Index, pd.Series)):
        if isinstance(values, pd.Series) and \
                pd.api.types.is_datetime64tz_dtype(values.dtype):
            array = np.asarray(list(values), dtype=object)
        else:
            array = values.to_numpy()
    elif isinstance(values, np.ndarray):
        array = values
    else:
        object_array = np.asarray(values, dtype=object)
        try:
            array = np.asarray(values)
        except (UnicodeDecodeError, ValueError):
            array = object_array
        infer_dtype = pd.api.types.infer_dtype(
            object_array.ravel(), skipna=False)
        if (array.dtype.kind in ("U", "S") and any(
                not isinstance(value, (str, bytes))
                for value in object_array.ravel())) or infer_dtype in (
                    "integer-na", "mixed", "mixed-integer-float"):
            array = object_array
    if array.ndim == 2 and array.shape[1] == 1:
        return array[:, 0]
    return array


def normalize_multioutput_array(values):
    """Return a homogeneous multi-output matrix when one is present."""
    if hasattr(values, "toarray") and not isinstance(
            values, (np.ndarray, pd.DataFrame, pd.Series)):
        array = values.toarray()
    else:
        array = normalize_single_output_array(values)
    if array.ndim == 2 and array.shape[1] > 1:
        return _coerce_numeric_multioutput_array(array)
    if array.ndim == 1 and array.dtype == object and len(array):
        first_value = array[0]
        first_row = (
            first_value.toarray().ravel()
            if hasattr(first_value, "toarray")
            else np.asarray(first_value))
        if first_row.ndim == 0:
            return None
        rows = [
            row.toarray().ravel().astype(object)
            if hasattr(row, "toarray")
            else np.asarray(row, dtype=object)
            for row in array
        ]
        if (all(row.ndim == 1 for row in rows) and
                len({row.shape for row in rows}) == 1 and
                rows[0].size > 1):
            stacked = np.stack(rows)
            return _coerce_numeric_multioutput_array(stacked)
    return None


def _coerce_numeric_multioutput_array(array):
    """Coerce homogeneous numeric rows without rounding integer labels."""
    if array.dtype != object:
        return array
    flat = array.ravel()
    if any(bool(pd.isna(value)) for value in flat):
        return array
    infer_dtype = pd.api.types.infer_dtype(flat, skipna=False)
    if infer_dtype == "integer":
        integers = [int(value) for value in flat]
        minimum = min(integers)
        maximum = max(integers)
        if minimum >= 0 and maximum <= np.iinfo(np.uint64).max:
            dtype = np.uint64
        elif (minimum >= np.iinfo(np.int64).min and
              maximum <= np.iinfo(np.int64).max):
            dtype = np.int64
        else:
            return array
        return np.asarray(array.tolist(), dtype=dtype)
    if infer_dtype not in ("boolean", "floating", "mixed-integer-float"):
        return array
    candidate = np.asarray(array.tolist())
    if candidate.dtype.kind not in ("b", "f", "i", "u"):
        return array
    for original, converted in zip(flat, candidate.ravel()):
        if (isinstance(original, numbers.Integral) and
                int(converted) != int(original)):
            return array
    return candidate


def pack_multioutput_rows(values):
    """Pack a multi-output matrix into one object cell per sample."""
    matrix = normalize_multioutput_array(values)
    if matrix is None:
        return values
    rows = np.empty(len(matrix), dtype=object)
    rows[:] = list(matrix)
    return rows


def _datetime_label_key(value):
    """Return an overflow-safe key for a datetime-like scalar."""
    if isinstance(value, np.datetime64):
        text = np.datetime_as_string(value, unit="auto")
    else:
        offset = value.utcoffset() if isinstance(
            value, datetime.datetime) else None
        if offset is not None:
            if isinstance(value, pd.Timestamp):
                epoch_attoseconds = (
                    datetime.date(1970, 1, 1).toordinal() *
                    86400 * 10 ** 18)
                return (
                    "datetime-instant",
                    epoch_attoseconds + int(value.value) * 10 ** 9)
            fraction = value.microsecond * 10 ** 12
            local_attoseconds = (
                (value.toordinal() * 86400 + value.hour * 3600 +
                 value.minute * 60 + value.second) * 10 ** 18 + fraction)
            offset_microseconds = (
                (offset.days * 86400 + offset.seconds) * 10 ** 6 +
                offset.microseconds)
            return (
                "datetime-instant",
                local_attoseconds - offset_microseconds * 10 ** 12)
        text = value.isoformat()
    match = re.fullmatch(
        r"([+-]?\d+)-(\d{2})-(\d{2})"
        r"(?:[T ](\d{2})(?::(\d{2}))?(?::(\d{2}))?"
        r"(?:\.(\d+))?([+-]\d{2}:\d{2}|Z)?)?", text)
    if match is None:
        return ("datetime", text)
    year, month, day, hour, minute, second, fraction, timezone = \
        match.groups()
    fraction = (fraction or "").ljust(18, "0")
    year = int(year)
    month = int(month)
    day = int(day)
    adjusted_year = year - (month <= 2)
    era = adjusted_year // 400
    year_of_era = adjusted_year - era * 400
    day_of_year = (
        (153 * (month + (-3 if month > 2 else 9)) + 2) // 5 +
        day - 1)
    day_of_era = (
        year_of_era * 365 + year_of_era // 4 -
        year_of_era // 100 + day_of_year)
    ordinal = (
        era * 146097 + day_of_era - 719468 +
        datetime.date(1970, 1, 1).toordinal())
    attoseconds = (
        (ordinal * 86400 +
         int(hour or 0) * 3600 + int(minute or 0) * 60 +
         int(second or 0)) * 10 ** 18 + int(fraction or 0))
    return ("datetime", attoseconds, timezone or "")


def _timedelta_label_key(value):
    """Return an exact key for a timedelta-like scalar."""
    if isinstance(value, pd.Timedelta):
        return ("timedelta", int(value.value) * 10 ** 9)
    if isinstance(value, datetime.timedelta):
        microseconds = (
            (value.days * 86400 + value.seconds) * 10 ** 6 +
            value.microseconds)
        return ("timedelta", microseconds * 10 ** 12)
    unit, multiplier = np.datetime_data(value.dtype)
    amount = int(value.astype("int64"))
    amount *= multiplier
    fixed_units = {
        "W": 7 * 86400 * 10 ** 18,
        "D": 86400 * 10 ** 18,
        "h": 3600 * 10 ** 18,
        "m": 60 * 10 ** 18,
        "s": 10 ** 18,
        "ms": 10 ** 15,
        "us": 10 ** 12,
        "ns": 10 ** 9,
        "ps": 10 ** 6,
        "fs": 10 ** 3,
        "as": 1,
    }
    if unit in fixed_units:
        return ("timedelta", amount * fixed_units[unit])
    if unit == "generic" and amount == 0:
        return ("timedelta", 0)
    if unit == "Y":
        amount *= 12
    return ("timedelta-months", amount)


def classification_label_key(label):
    """Return an exact hash key consistent with label equality."""
    missing = np.asarray(pd.isna(label))
    if missing.ndim == 0 and bool(missing):
        return ("missing",)
    if isinstance(
            label, (datetime.date, datetime.datetime,
                    np.datetime64, pd.Timestamp)):
        return _datetime_label_key(label)
    if isinstance(
            label, (datetime.timedelta, np.timedelta64, pd.Timedelta)):
        return _timedelta_label_key(label)
    if isinstance(label, _ArrowTemporalScalar):
        return label.key
    if isinstance(label, datetime.time):
        attoseconds = (
            (label.hour * 3600 + label.minute * 60 + label.second) *
            10 ** 18 + label.microsecond * 10 ** 12)
        offset = label.utcoffset()
        if offset is None:
            return ("time-naive", attoseconds)
        offset_attoseconds = (
            (offset.days * 86400 + offset.seconds) * 10 ** 18 +
            offset.microseconds * 10 ** 12)
        return ("time-aware", attoseconds - offset_attoseconds)
    if isinstance(label, (bool, np.bool_)):
        return ("number", int(label), 1)
    if isinstance(label, Decimal):
        if label.is_finite():
            numerator, denominator = label.as_integer_ratio()
            return ("number", numerator, denominator)
        if label.is_infinite():
            return ("infinity", 1 if label > 0 else -1)
    if isinstance(label, numbers.Rational):
        return ("number", int(label.numerator), int(label.denominator))
    if isinstance(label, numbers.Integral):
        return ("number", int(label), 1)
    if isinstance(label, numbers.Real):
        value = float(label)
        if math.isfinite(value):
            numerator, denominator = label.as_integer_ratio()
            return ("number", numerator, denominator)
        return ("infinity", math.copysign(1, value))
    if isinstance(label, numbers.Complex) and label.imag == 0:
        return classification_label_key(label.real)
    hash(label)
    return ("value", label)


def classification_labels_equal(left, right):
    """Compare scalar classification labels across temporal containers."""
    left_array = np.asarray(left)
    right_array = np.asarray(right)
    if left_array.ndim > 0 or right_array.ndim > 0:
        if left_array.shape != right_array.shape:
            return False
        return all(
            classification_labels_equal(left_value, right_value)
            for left_value, right_value in zip(
                left_array.ravel(), right_array.ravel()))
    left_missing = np.asarray(pd.isna(left))
    right_missing = np.asarray(pd.isna(right))
    if left_missing.ndim == right_missing.ndim == 0 and (
            bool(left_missing) or bool(right_missing)):
        return bool(left_missing) and bool(right_missing)
    try:
        return classification_label_key(left) == \
            classification_label_key(right)
    except TypeError:
        pass
    return bool(left == right)


def compute_classification_diff(pred_y, true_y):
    """Compare single-output labels without shape broadcasting or coercion."""
    multi_predictions = normalize_multioutput_array(pred_y)
    multi_labels = normalize_multioutput_array(true_y)
    if multi_predictions is not None or multi_labels is not None:
        if (multi_predictions is None or multi_labels is None or
                multi_predictions.shape != multi_labels.shape):
            raise ValueError("Predictions and labels must have the same shape")
        element_diff = compute_classification_diff(
            multi_predictions.ravel(), multi_labels.ravel())
        return element_diff.reshape(multi_predictions.shape).any(axis=1)
    predictions = normalize_single_output_array(pred_y)
    labels = normalize_single_output_array(true_y)
    if predictions.shape != labels.shape:
        raise ValueError("Predictions and labels must have the same shape")
    if (predictions.dtype != object and labels.dtype != object and
            predictions.dtype.kind == labels.dtype.kind and
            predictions.dtype.kind not in ("M", "m") and
            not np.asarray(pd.isna(predictions), dtype=bool).any() and
            not np.asarray(pd.isna(labels), dtype=bool).any()):
        return predictions != labels
    if (predictions.dtype == labels.dtype and
            predictions.dtype.kind in ("M", "m")):
        return ~(
            (predictions == labels) |
            (np.isnat(predictions) & np.isnat(labels)))
    try:
        prediction_codes, label_codes = classification_label_codes(
            predictions, labels)
        return prediction_codes != label_codes
    except (TypeError, ValueError):
        pass
    return np.asarray([
        not classification_labels_equal(prediction, label)
        for prediction, label in zip(predictions, labels)
    ], dtype=bool)


def classification_label_codes(*values):
    """Factorize label arrays by exact canonical scalar keys."""
    key_to_code = {}
    next_code = 0
    encoded_values = []
    for value in values:
        array = normalize_single_output_array(value).ravel()
        infer_dtype = pd.api.types.infer_dtype(array, skipna=False)
        if array.dtype != object or infer_dtype in (
                "boolean", "bytes", "floating", "integer", "string"):
            if array.dtype == object:
                codes, unique = factorize_label_array(array)
            else:
                unique, codes = np.unique(array, return_inverse=True)
            unique_codes = []
            for label in unique:
                key = classification_label_key(label)
                if key not in key_to_code:
                    key_to_code[key] = next_code
                    next_code += 1
                unique_codes.append(key_to_code[key])
            encoded = np.asarray(unique_codes, dtype=int)[codes]
        else:
            encoded = []
            for label in array:
                key = classification_label_key(label)
                if key not in key_to_code:
                    key_to_code[key] = next_code
                    next_code += 1
                encoded.append(key_to_code[key])
            encoded = np.asarray(encoded, dtype=int)
        encoded_values.append(encoded)
    return encoded_values


def factorize_label_array(array):
    """Factorize object labels with the pandas 0.25-compatible API."""
    codes, unique = pd.factorize(array, sort=False)
    if np.any(codes == -1):
        missing = next(value for value in array if bool(pd.isna(value)))
        unique = np.append(np.asarray(unique, dtype=object), missing)
        codes = np.where(codes == -1, len(unique) - 1, codes)
    return codes, unique


def compute_regression_residuals(pred_y, true_y):
    """Subtract integer inputs without wraparound or rounding."""
    predictions = coerce_integer_array(pred_y)
    if predictions is not None:
        labels = coerce_integer_array(true_y)
        if labels is not None:
            predictions = normalize_single_output_array(predictions)
            labels = normalize_single_output_array(labels)
            if predictions.shape != labels.shape:
                raise ValueError(
                    "Predictions and labels must have the same shape")
            # Inspect operands before promotion: mixing int64 and uint64 would
            # otherwise round to float64. Python integers also keep
            # abs(INT64_MIN) and differences spanning the full 64-bit range.
            return compute_integer_residuals(predictions, labels)
    predictions = normalize_single_output_array(pred_y)
    labels = normalize_single_output_array(true_y)
    if predictions.shape != labels.shape:
        raise ValueError("Predictions and labels must have the same shape")
    if predictions.dtype == object or labels.dtype == object:
        def is_missing(value):
            missing = np.asarray(pd.isna(value))
            return missing.ndim == 0 and bool(missing)

        def integer_or_missing(value):
            return isinstance(value, numbers.Integral) or is_missing(value)

        if (all(integer_or_missing(value) for value in predictions) and
                all(integer_or_missing(value) for value in labels)):
            return np.asarray([
                np.nan if is_missing(prediction) or is_missing(label)
                else int(prediction) - int(label)
                for prediction, label in zip(predictions, labels)
            ], dtype=object)
        if (any(is_missing(value) for value in predictions) or
                any(is_missing(value) for value in labels)):
            return np.asarray([
                np.nan if is_missing(prediction) or is_missing(label)
                else prediction - label
                for prediction, label in zip(predictions, labels)
            ])
    return predictions - labels


def generate_random_unique_indexes(count, nnz):
    """Utility to generate a list of random unique indexes in memory.

    Uses Knuth's n of k algorithm to generate the list in memory.

    :param count: The range of values to choose from.
    :type count: int
    :param nnz: The number of unique values to choose.
    :type nnz: int
    :return: The list of unique indexes of length nnz.
    :rtype: numpy.ndarray
    """
    if nnz > count:
        raise Exception("Knuth n-of-k algorithms requires 0 < n < k")
    indexes = np.zeros(nnz, dtype=int)
    current = 0
    i = 0
    while i < count and current < nnz:
        probability = (nnz - current) / (count - i)
        if random.random() < probability:
            indexes[current] = i
            current += 1
        i += 1
    return indexes


def is_spark(df):
    """Utility to check if a dataframe is a spark dataframe.

    :param df: The dataframe to check.
    :type df: pyspark.sql.dataframe.DataFrame or pandas.DataFrame
    :return: True if the dataframe is a spark dataframe, False otherwise.
    :rtype: bool
    """
    try:
        return spark_available and isinstance(df, ps.frame.DataFrame)
    except Exception:
        return False
