# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json
import random
from unittest import mock

import pytest
from tests.common_utils import (RandomForecastingModel,
                                create_tiny_forecasting_dataset)

from responsibleai import FeatureMetadata, RAIInsights

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
