# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json

from pytest import approx
from raimitigations.databalanceanalysis import (AggregateBalanceMeasure,
                                                DistributionBalanceMeasure,
                                                FeatureBalanceMeasure)


class TestRAIMitigations:
    def test_aggregate_balance_measures_one_feature(
        self,
        synthetic_data,
        feature_1,
        expected_aggregate_measures_feature_1,
    ):
        agg_measures = (
            AggregateBalanceMeasure(sensitive_cols=[feature_1])
            .measures(synthetic_data)
            .to_json()
        )
        agg_dict = json.loads(agg_measures)
        actual = {k: v["0"] for k, v in agg_dict.items()}
        assert actual == approx(expected_aggregate_measures_feature_1)

    def test_aggregate_balance_measures_both_features(
        self,
        synthetic_data,
        feature_1,
        feature_2,
        expected_aggregate_measures_both_features,
    ):
        agg_measures = (
            AggregateBalanceMeasure(sensitive_cols=[feature_1, feature_2])
            .measures(df=synthetic_data)
            .to_json()
        )
        agg_dict = json.loads(agg_measures)
        actual = {k: v["0"] for k, v in agg_dict.items()}
        assert actual == approx(expected_aggregate_measures_both_features)

    def test_distribution_balance_measures_feature_1(
        self,
        synthetic_data,
        feature_1,
        expected_distribution_measures_feature_1,
    ):
        dist_measures = (
            DistributionBalanceMeasure(sensitive_cols=[feature_1])
            .measures(df=synthetic_data)
            .to_json()
        )
        dist_dict = json.loads(dist_measures)
        actual = {k: v["0"] for k, v in dist_dict.items()}
        assert actual == approx(expected_distribution_measures_feature_1)

    def test_distribution_balance_measures_feature_2(
        self,
        synthetic_data,
        feature_2,
        expected_distribution_measures_feature_2,
    ):
        dist_measures = (
            DistributionBalanceMeasure(sensitive_cols=[feature_2])
            .measures(df=synthetic_data)
            .to_json()
        )
        dist_dict = json.loads(dist_measures)
        actual = {k: v["0"] for k, v in dist_dict.items()}
        assert actual == approx(expected_distribution_measures_feature_2)

    def test_feature_balance_measures(
        self,
        synthetic_data,
        feature_1,
        label,
        expected_feature_balance_measures,
    ):
        feat_measures = (
            FeatureBalanceMeasure(sensitive_cols=[feature_1], label_col=label)
            .measures(df=synthetic_data)
            .query("ClassA == 'Male' and ClassB == 'Female'")
            .to_json()
        )
        feat_dict = json.loads(feat_measures)
        actual = {k: v["0"] for k, v in feat_dict.items()}
        assert actual == approx(expected_feature_balance_measures)
