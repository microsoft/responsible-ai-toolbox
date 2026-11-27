# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json
import random
from unittest import mock

import pandas as pd
import pytest
from tests.common_utils import (RandomForecastingModel,
                                create_tiny_forecasting_dataset)

from responsibleai import FeatureMetadata, RAIInsights
from responsibleai._internal._served_model_wrapper import ServedModelWrapper

RAI_INSIGHTS_DIR_NAME = "rai_insights_test_served_model"


# create a pytest fixture
@pytest.fixture(scope="session")
def rai_forecasting_insights_for_served_model():
    X_train, X_test, y_train, y_test = create_tiny_forecasting_dataset()
    train = X_train.copy()
    train["target"] = y_train
    test = X_test.copy()
    test["target"] = y_test
    model = RandomForecastingModel()

    # create RAI Insights and save it
    rai_insights = RAIInsights(
        model=model,
        train=train,
        test=test,
        target_column="target",
        task_type='forecasting',
        feature_metadata=FeatureMetadata(
            datetime_features=['time'],
            time_series_id_features=['id']
        ),
        forecasting_enabled=True)
    rai_insights.save(RAI_INSIGHTS_DIR_NAME)


@mock.patch("requests.post")
@mock.patch.dict("os.environ", {"RAI_MODEL_SERVING_PORT": "5432"})
def test_served_model(
        mock_post,
        rai_forecasting_insights_for_served_model):
    X_train, X_test, _, _ = create_tiny_forecasting_dataset()

    mock_post.return_value = mock.Mock(
        status_code=200,
        content=json.dumps({
            "predictions": [random.random() for _ in range(len(X_train))]
        })
    )

    rai_insights = RAIInsights.load(RAI_INSIGHTS_DIR_NAME)
    forecasts = rai_insights.model.forecast(X_test)
    assert len(forecasts) == len(X_test)
    assert mock_post.call_count == 1


SERVED_MODEL_POST = \
    "responsibleai._internal._served_model_wrapper.post_with_retries"


@pytest.mark.parametrize("status_code", [200, 201, 399, 600])
@mock.patch(SERVED_MODEL_POST)
def test_served_model_forecast(mock_post, status_code):
    mock_post.return_value = mock.Mock(
        status_code=status_code,
        content=json.dumps({"predictions": [1.0, 2.0]}))

    forecasts = ServedModelWrapper(5432).forecast(
        pd.DataFrame({"x": [1, 2]}))

    assert forecasts == [1.0, 2.0]
    assert mock_post.call_args.args[0] == \
        "http://localhost:5432/invocations"


@mock.patch(SERVED_MODEL_POST)
def test_served_model_unreachable(mock_post):
    error = RuntimeError("Unable to post to web service")
    mock_post.side_effect = error

    with pytest.raises(RuntimeError) as exc:
        ServedModelWrapper(5432).forecast(pd.DataFrame({"x": [1]}))
    assert str(exc.value) == (
        "Could not retrieve predictions. Request to the model server "
        "failed: Unable to post to web service")
    assert exc.value.__cause__ is error


@pytest.mark.parametrize("status_code, content", [
    (500, b"Internal Server Error"),
    (599, b"Network Connect Timeout Error"),
    (400, json.dumps({"error_code": "BAD_REQUEST",
                      "message": "Invalid input"})),
])
@mock.patch(SERVED_MODEL_POST)
def test_served_model_http_error(mock_post, status_code, content):
    mock_post.return_value = mock.Mock(
        status_code=status_code, content=content)

    expected = ("Could not retrieve predictions. Model server returned "
                f"status code {status_code}")
    with pytest.raises(RuntimeError, match=expected) as exc:
        ServedModelWrapper(5432).forecast(pd.DataFrame({"x": [1]}))
    assert str(content) in str(exc.value)
