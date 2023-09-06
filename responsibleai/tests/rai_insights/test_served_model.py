# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json
import os
import pytest
import random
from responsibleai import RAIInsights, FeatureMetadata
from tests.common_utils import (
    create_tiny_forecasting_dataset, RandomForecastingModel)
from unittest.mock import patch, Mock


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


@patch("requests.post")
def test_served_model(mock_post, rai_forecasting_insights_for_served_model):
    X_train, X_test, _, _ = create_tiny_forecasting_dataset()

    mock_post.return_value = Mock(
        status_code=200,
        content=json.dumps({
            "predictions": [random.random() for _ in range(len(X_train))]
        })
    )

    # set port number for served model before loading RAI Insights
    os.environ["RAI_MODEL_SERVING_PORT"] = "5123"
    rai_insights = RAIInsights.load(RAI_INSIGHTS_DIR_NAME)
    forecasts = rai_insights.model.forecast(X_test)
    assert len(forecasts) == len(X_test)
    assert mock_post.call_count == 1


@patch("requests.post")
def test_served_model_failed(
        mock_post,
        rai_forecasting_insights_for_served_model):
    X_train, X_test, _, _ = create_tiny_forecasting_dataset()

    response_content = "Could not connect to host since it actively " \
        "refuses the connection."
    mock_post.return_value = Mock(
        status_code=400,
        content=response_content
    )

    # set port number for served model before loading RAI Insights
    os.environ["RAI_MODEL_SERVING_PORT"] = "5123"
    rai_insights = RAIInsights.load(RAI_INSIGHTS_DIR_NAME)
    with pytest.raises(Exception) as exc:
        rai_insights.model.forecast(X_test)
        assert ("Could not retrieve predictions. "
                "Model server returned status code 400 "
                f"and the following response: {response_content}"
                in exc.value.args[0])
