# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import copy

import pandas as pd
import pytest

from ..common_utils import create_adult_income_dataset


@pytest.fixture(scope="session")
def adult_data():
    (
        data_train,
        data_test,
        y_train,
        y_test,
        categorical_features,
        _,
        target_col,
        _,
    ) = create_adult_income_dataset()
    train_df = copy.deepcopy(data_train)
    test_df = copy.deepcopy(data_test)
    train_df[target_col] = y_train
    test_df[target_col] = y_test
    cols_of_interest = categorical_features
    return train_df, test_df, cols_of_interest, target_col


@pytest.fixture(scope="session")
def feature_balance_measures():
    return pd.DataFrame(
        {
            "ClassA": {"0": "White", "1": "Male"},
            "ClassB": {"0": "Other", "1": "Female"},
            "FeatureName": {"0": "race", "1": "gender"},
            "dp": {"0": 0.0982367846, "1": 0.1977193125},
            "pmi": {"0": 0.4906283898, "1": 1.0465727536},
            "sdc": {"0": 0.1394139444, "1": 0.1622153797},
            "ji": {"0": 0.1846417746, "1": 0.2230209651},
            "krc": {"0": -4.6080688829, "1": -0.8738917288},
            "llr": {"0": 2.264674102, "1": 1.7462342396},
            "t_test": {"0": -1.0210127581, "1": -0.3685341442},
            "ttest_pvalue": {"0": 0.2466906059, "1": 0.3876079751},
        }
    )


@pytest.fixture(scope="session")
def distribution_balance_measures():
    return pd.DataFrame(
        {
            "FeatureName": {"0": "race", "1": "gender"},
            "kl_divergence": {"0": 0.2791392127, "1": 0.0576400449},
            "js_dist": {"0": 0.2741838602, "1": 0.1209204479},
            "wasserstein_dist": {"0": 0.3549600737, "1": 0.168112715},
            "inf_norm_dist": {"0": 0.3549600737, "1": 0.168112715},
            "total_variation_dist": {"0": 0.3549600737, "1": 0.168112715},
            "chi_sq_p_value": {"0": 0.0, "1": 0.0},
            "chi_sq_stat": {"0": 13127.8433660934, "1": 2944.6623157248},
        }
    )


@pytest.fixture(scope="session")
def aggregate_balance_measures():
    return pd.DataFrame(
        {
            "theil_l_index": {"0": 0.3912215368},
            "theil_t_index": {"0": 0.3420484048},
            "atkinson_index": {"0": 0.3237696704},
        }
    )


@pytest.fixture(scope="session")
def synthetic_data(label, feature_1, feature_2):
    # https://github.com/microsoft/SynapseML/blob/4975dda59c8957270c64aa1eaf295673e14ac815/core/src/test/scala/com/microsoft/azure/synapse/ml/exploratory/DataBalanceTestBase.scala#L31
    rows = [
        (0, "Male", "Asian"),
        (0, "Male", "White"),
        (1, "Male", "Other"),
        (1, "Male", "Black"),
        (0, "Female", "White"),
        (0, "Female", "Black"),
        (1, "Female", "Black"),
        (0, "Other", "Asian"),
        (0, "Other", "White"),
    ]
    return pd.DataFrame(rows, columns=[label, feature_1, feature_2])


@pytest.fixture(scope="session")
def label():
    return "Label"


@pytest.fixture(scope="session")
def feature_1():
    return "Gender"


@pytest.fixture(scope="session")
def feature_2():
    return "Ethnicity"


@pytest.fixture(scope="session")
def expected_aggregate_measures_feature_1():
    # https://github.com/microsoft/SynapseML/blob/4975dda59c8957270c64aa1eaf295673e14ac815/core/src/test/scala/com/microsoft/azure/synapse/ml/exploratory/AggregateBalanceMeasureSuite.scala#L54
    return {
        "atkinson_index": 0.03850028646172776,
        "theil_l_index": 0.039261011885461196,
        "theil_t_index": 0.03775534151008828,
    }


@pytest.fixture(scope="session")
def expected_aggregate_measures_both_features():
    # https://github.com/microsoft/SynapseML/blob/4975dda59c8957270c64aa1eaf295673e14ac815/core/src/test/scala/com/microsoft/azure/synapse/ml/exploratory/AggregateBalanceMeasureSuite.scala#L108
    return {
        "atkinson_index": 0.030659793186437745,
        "theil_l_index": 0.03113963808639034,
        "theil_t_index": 0.03624967113471546,
    }


@pytest.fixture(scope="session")
def expected_distribution_measures_feature_1():
    # https://github.com/microsoft/SynapseML/blob/4975dda59c8957270c64aa1eaf295673e14ac815/core/src/test/scala/com/microsoft/azure/synapse/ml/exploratory/DistributionBalanceMeasureSuite.scala#L49
    return {
        "FeatureName": "Gender",
        "kl_divergence": 0.03775534151008829,
        "js_dist": 0.09785224086736323,
        "wasserstein_dist": 0.07407407407407407,
        "inf_norm_dist": 0.1111111111111111,
        "total_variation_dist": 0.1111111111111111,
        "chi_sq_p_value": 0.7165313105737893,
        "chi_sq_stat": 0.6666666666666666,
    }


@pytest.fixture(scope="session")
def expected_distribution_measures_feature_2():
    # https://github.com/microsoft/SynapseML/blob/4975dda59c8957270c64aa1eaf295673e14ac815/core/src/test/scala/com/microsoft/azure/synapse/ml/exploratory/DistributionBalanceMeasureSuite.scala#L84
    return {
        "FeatureName": "Ethnicity",
        "kl_divergence": 0.07551068302017659,
        "js_dist": 0.14172745151398888,
        "wasserstein_dist": 0.08333333333333333,
        "inf_norm_dist": 0.1388888888888889,
        "total_variation_dist": 0.16666666666666666,
        "chi_sq_p_value": 0.7476795872877147,
        "chi_sq_stat": 1.222222222222222,
    }


@pytest.fixture(scope="session")
def expected_feature_balance_measures():
    # https://github.com/microsoft/SynapseML/blob/4975dda59c8957270c64aa1eaf295673e14ac815/core/src/test/scala/com/microsoft/azure/synapse/ml/exploratory/FeatureBalanceMeasureSuite.scala#L50
    # Note: raimitigations does not compute n_pmi_y, n_pmi_xy, and s_pmi.
    return {
        "ClassA": "Male",
        "ClassB": "Female",
        "FeatureName": "Gender",
        "dp": 0.16666666666666669,
        "pmi": 0.4054651081081645,
        "sdc": 0.1190476190476191,
        "ji": 0.20000000000000004,
        "krc": 0.18801108758923135,
        "llr": 0.6931471805599454,
        # These next values are computed in raimitigations but not SynapseML,
        # so their actual values from raimitigations are used.
        "t_test": -0.1855414423,
        "ttest_pvalue": 0.4349585786,
    }
