# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json
import os
import random
from responsibleai import RAIInsights, FeatureMetadata
from tests.common_utils import (
    create_tiny_forecasting_dataset, RandomForecastingModel)
from unittest.mock import MagicMock, patch, Mock


@patch("requests.post")
def test_served_model(mock_post):
    X_train, X_test, y_train, y_test = create_tiny_forecasting_dataset()
    train = X_train.copy()
    train["target"] = y_train
    test = X_test.copy()
    test["target"] = y_test
    model = RandomForecastingModel()

    # create RAI Insights and save it
    rai_insights_dir_name = "rai_insights_test_served_model"
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
    rai_insights.save(rai_insights_dir_name)

    mock_post.return_value = Mock(
            status_code=200,
            content=json.dumps({
                "predictions": [random.random() for _ in range(len(X_train))]
            })
        )

    # set port number for served model before loading RAI Insights
    os.environ["RAI_MODEL_SERVING_PORT"] = "5123"
    rai_insights = RAIInsights.load(rai_insights_dir_name)
    forecasts = rai_insights.model.forecast(X_test)
    assert len(forecasts) == len(X_test)
    assert mock_post.call_count == 1
