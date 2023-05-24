# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd
import pytest
from tests.common_utils import create_adult_income_dataset

# Constants representing columns in the synthetic_data fixture
SYNTHETIC_DATA_LABEL = "Label"
SYNTHETIC_DATA_GENDER = "Gender"
SYNTHETIC_DATA_ETHNICITY = "Ethnicity"


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
        classes,
        _,
        _,
    ) = create_adult_income_dataset(create_small_dataset=False)
    data_train[target_col] = y_train
    data_test[target_col] = y_test
    return data_train, data_test, categorical_features, target_col, classes


@pytest.fixture(scope="session")
def adult_data_feature_balance_measures():
    return {
        "1": pd.DataFrame(
            {
                "ClassA": {"0": "White", "1": "Male"},
                "ClassB": {"0": "Other", "1": "Female"},
                "FeatureName": {"0": "race", "1": "gender"},
                "StatisticalParity": {"0": 0.0982367846, "1": 0.1977193125},
                "PointwiseMutualInfo": {"0": 0.4906283898, "1": 1.0465727536},
                "SorensonDiceCoeff": {"0": 0.1394139444, "1": 0.1622153797},
                "JaccardIndex": {"0": 0.1846417746, "1": 0.2230209651},
                "KendallRankCorrelation": {
                    "0": -4.6080688829,
                    "1": -0.8738917288,
                },
                "LogLikelihoodRatio": {"0": 2.264674102, "1": 1.7462342396},
                "TTest": {"0": -1.0210127581, "1": -0.3685341442},
                "TTestPValue": {"0": 0.2466906059, "1": 0.3876079751},
            }
        )
    }


@pytest.fixture(scope="session")
def adult_data_distribution_balance_measures():
    return pd.DataFrame(
        {
            "FeatureName": {"0": "race", "1": "gender"},
            "KLDivergence": {"0": 0.2791392127, "1": 0.0576400449},
            "JensenShannonDist": {"0": 0.2741838602, "1": 0.1209204479},
            "WassersteinDist": {"0": 0.3549600737, "1": 0.168112715},
            "InfiniteNormDist": {"0": 0.3549600737, "1": 0.168112715},
            "TotalVarianceDist": {"0": 0.3549600737, "1": 0.168112715},
            "ChiSquarePValue": {"0": 0.0, "1": 0.0},
            "ChiSquareStat": {"0": 13127.8433660934, "1": 2944.6623157248},
            "CrossEntropy": {"0": 1.5057745222, "1": 1.0865356576},
        }
    )


@pytest.fixture(scope="session")
def adult_data_aggregate_balance_measures():
    return pd.DataFrame(
        {
            "TheilLIndex": {"0": 0.3912215368},
            "TheilTIndex": {"0": 0.3420484048},
            "AtkinsonIndex": {"0": 0.3237696704},
        }
    )


# This synthetic dataset was manually created in the SynapseML data balance
# feature so that metrics can be manually computed, thought of as the expected
# results, and then compared to the actual results. This and the expected
# measure fixtures below it are ports from the open source SynapseML repo.
@pytest.fixture(scope="session")
def synthetic_data():
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
    return pd.DataFrame(
        rows,
        columns=[
            SYNTHETIC_DATA_LABEL,
            SYNTHETIC_DATA_GENDER,
            SYNTHETIC_DATA_ETHNICITY,
        ],
    )


@pytest.fixture(scope="session")
def expected_aggregate_measures_gender():
    return {
        "AtkinsonIndex": 0.03850028646172776,
        "TheilLIndex": 0.039261011885461196,
        "TheilTIndex": 0.03775534151008828,
    }


@pytest.fixture(scope="session")
def expected_aggregate_measures_gender_ethnicity():
    return {
        "AtkinsonIndex": 0.030659793186437745,
        "TheilLIndex": 0.03113963808639034,
        "TheilTIndex": 0.03624967113471546,
    }


@pytest.fixture(scope="session")
def expected_distribution_measures_gender():
    return {
        "FeatureName": "Gender",
        "KLDivergence": 0.03775534151008829,
        "JensenShannonDist": 0.09785224086736323,
        "WassersteinDist": 0.07407407407407407,
        "InfiniteNormDist": 0.1111111111111111,
        "TotalVarianceDist": 0.1111111111111111,
        "ChiSquarePValue": 0.7165313105737893,
        "ChiSquareStat": 0.6666666666666666,
        "CrossEntropy": 1.6416041676697,
    }


@pytest.fixture(scope="session")
def expected_distribution_measures_ethnicity():
    return {
        "FeatureName": "Ethnicity",
        "KLDivergence": 0.07551068302017659,
        "JensenShannonDist": 0.14172745151398888,
        "WassersteinDist": 0.08333333333333333,
        "InfiniteNormDist": 0.1388888888888889,
        "TotalVarianceDist": 0.16666666666666666,
        "ChiSquarePValue": 0.7476795872877147,
        "ChiSquareStat": 1.222222222222222,
        "CrossEntropy": 2.1274437525244,
    }


@pytest.fixture(scope="session")
def expected_feature_balance_measures_gender():
    # Note: Compared to SynapseML, this module does not compute n_pmi_y,
    # n_pmi_xy, and s_pmi. However, this module does compute TTest and
    # TTestPValue so their actual values are used.
    return {
        "ClassA": "Male",
        "ClassB": "Female",
        "FeatureName": "Gender",
        "StatisticalParity": 0.16666666666666669,
        "PointwiseMutualInfo": 0.4054651081081645,
        "SorensonDiceCoeff": 0.1190476190476191,
        "JaccardIndex": 0.20000000000000004,
        "KendallRankCorrelation": 0.18801108758923135,
        "LogLikelihoodRatio": 0.6931471805599454,
        "TTest": -0.1855414423,
        "TTestPValue": 0.4349585786,
    }


@pytest.fixture(scope="session")
def singular_valued_col_data():
    return pd.DataFrame(
        {
            # Note that the col only has 1 unique value
            "col1": [1, 1, 1, 1, 1],
            "col2": [1, 2, 3, 4, 5],
            "target": [0, 1, 0, 1, 0],
        }
    )
