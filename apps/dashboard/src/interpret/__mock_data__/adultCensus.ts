// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDataset } from "@responsible-ai/core-ui";

export const adultCensusWithDataBalance: IDataset = {
  categorical_features: [
    "workclass",
    "education",
    "marital-status",
    "occupation",
    "relationship",
    "race",
    "gender",
    "native-country"
  ],
  class_names: ["<=50K", ">50K"],
  feature_names: [
    "age",
    "workclass",
    "fnlwgt",
    "education",
    "education-num",
    "marital-status",
    "occupation",
    "relationship",
    "race",
    "gender",
    "capital-gain",
    "capital-loss",
    "hours-per-week",
    "native-country"
  ],
  features: [
    [
      50,
      "Private",
      39590,
      "HS-grad",
      9,
      "Married-civ-spouse",
      "Farming-fishing",
      "Husband",
      "White",
      "Male",
      0,
      0,
      48,
      "United-States"
    ],
    [
      24,
      "Local-gov",
      174413,
      "Bachelors",
      13,
      "Never-married",
      "Prof-specialty",
      "Not-in-family",
      "White",
      "Female",
      0,
      1974,
      40,
      "United-States"
    ],
    [
      40,
      "Private",
      132222,
      "HS-grad",
      9,
      "Never-married",
      "Other-service",
      "Not-in-family",
      "White",
      "Male",
      0,
      0,
      40,
      "United-States"
    ],
    [
      33,
      "Private",
      202046,
      "Bachelors",
      13,
      "Married-civ-spouse",
      "Exec-managerial",
      "Husband",
      "White",
      "Male",
      0,
      0,
      45,
      "United-States"
    ],
    [
      24,
      "Private",
      160261,
      "Some-college",
      10,
      "Never-married",
      "Sales",
      "Not-in-family",
      "Asian-Pac-Islander",
      "Male",
      0,
      0,
      64,
      "?"
    ],
    [
      44,
      "Private",
      201495,
      "Assoc-acdm",
      12,
      "Married-civ-spouse",
      "Exec-managerial",
      "Husband",
      "White",
      "Male",
      0,
      1977,
      50,
      "United-States"
    ],
    [
      26,
      "Self-emp-not-inc",
      33016,
      "Assoc-voc",
      11,
      "Divorced",
      "Other-service",
      "Unmarried",
      "White",
      "Female",
      0,
      0,
      55,
      "United-States"
    ],
    [
      49,
      "Private",
      390746,
      "Bachelors",
      13,
      "Married-civ-spouse",
      "Prof-specialty",
      "Husband",
      "White",
      "Male",
      0,
      1672,
      45,
      "Ireland"
    ],
    [
      40,
      "Self-emp-not-inc",
      211518,
      "Bachelors",
      13,
      "Divorced",
      "Other-service",
      "Unmarried",
      "White",
      "Female",
      0,
      0,
      20,
      "United-States"
    ],
    [
      36,
      "State-gov",
      173273,
      "Masters",
      14,
      "Never-married",
      "Prof-specialty",
      "Not-in-family",
      "Black",
      "Female",
      0,
      0,
      40,
      "United-States"
    ],
    [
      36,
      "Private",
      224541,
      "7th-8th",
      4,
      "Married-civ-spouse",
      "Handlers-cleaners",
      "Husband",
      "White",
      "Male",
      0,
      0,
      40,
      "El-Salvador"
    ],
    [
      22,
      "Private",
      202153,
      "Some-college",
      10,
      "Never-married",
      "Adm-clerical",
      "Own-child",
      "White",
      "Female",
      0,
      0,
      30,
      "United-States"
    ],
    [
      51,
      "Private",
      27539,
      "Some-college",
      10,
      "Married-civ-spouse",
      "Transport-moving",
      "Husband",
      "White",
      "Male",
      0,
      0,
      60,
      "United-States"
    ],
    [
      60,
      "Private",
      137490,
      "5th-6th",
      3,
      "Separated",
      "Handlers-cleaners",
      "Not-in-family",
      "Black",
      "Male",
      0,
      0,
      40,
      "United-States"
    ],
    [
      40,
      "Private",
      77975,
      "HS-grad",
      9,
      "Married-civ-spouse",
      "Craft-repair",
      "Husband",
      "White",
      "Male",
      0,
      0,
      40,
      "United-States"
    ],
    [
      29,
      "Private",
      485944,
      "Bachelors",
      13,
      "Never-married",
      "Sales",
      "Own-child",
      "Black",
      "Male",
      0,
      0,
      40,
      "United-States"
    ],
    [
      34,
      "Private",
      205072,
      "HS-grad",
      9,
      "Never-married",
      "Sales",
      "Not-in-family",
      "White",
      "Male",
      0,
      0,
      50,
      "United-States"
    ],
    [
      41,
      "Private",
      244522,
      "HS-grad",
      9,
      "Married-civ-spouse",
      "Craft-repair",
      "Husband",
      "White",
      "Male",
      7688,
      0,
      42,
      "United-States"
    ],
    [
      35,
      "?",
      111377,
      "Bachelors",
      13,
      "Married-civ-spouse",
      "?",
      "Husband",
      "White",
      "Male",
      0,
      0,
      50,
      "United-States"
    ],
    [
      35,
      "Private",
      250988,
      "Bachelors",
      13,
      "Married-civ-spouse",
      "Sales",
      "Husband",
      "White",
      "Male",
      0,
      0,
      40,
      "United-States"
    ],
    [
      28,
      "Private",
      110408,
      "HS-grad",
      9,
      "Married-civ-spouse",
      "Sales",
      "Husband",
      "White",
      "Male",
      0,
      0,
      45,
      "United-States"
    ],
    [
      31,
      "Private",
      463601,
      "HS-grad",
      9,
      "Never-married",
      "Handlers-cleaners",
      "Other-relative",
      "Black",
      "Male",
      0,
      0,
      40,
      "United-States"
    ],
    [
      45,
      "Self-emp-not-inc",
      165267,
      "9th",
      5,
      "Married-civ-spouse",
      "Transport-moving",
      "Husband",
      "Black",
      "Male",
      0,
      0,
      40,
      "United-States"
    ],
    [
      49,
      "Private",
      149218,
      "HS-grad",
      9,
      "Divorced",
      "Craft-repair",
      "Unmarried",
      "White",
      "Male",
      0,
      0,
      50,
      "United-States"
    ],
    [
      44,
      "Private",
      96129,
      "Bachelors",
      13,
      "Married-civ-spouse",
      "Exec-managerial",
      "Husband",
      "White",
      "Male",
      0,
      0,
      40,
      "United-States"
    ],
    [
      38,
      "Private",
      127493,
      "Assoc-acdm",
      12,
      "Widowed",
      "Sales",
      "Unmarried",
      "White",
      "Female",
      0,
      0,
      35,
      "United-States"
    ],
    [
      35,
      "Private",
      114765,
      "Masters",
      14,
      "Never-married",
      "Prof-specialty",
      "Not-in-family",
      "White",
      "Female",
      0,
      0,
      38,
      "United-States"
    ],
    [
      29,
      "Private",
      180271,
      "HS-grad",
      9,
      "Never-married",
      "Tech-support",
      "Own-child",
      "White",
      "Male",
      0,
      0,
      40,
      "United-States"
    ],
    [
      40,
      "Local-gov",
      208875,
      "Masters",
      14,
      "Divorced",
      "Prof-specialty",
      "Not-in-family",
      "White",
      "Female",
      0,
      0,
      50,
      "United-States"
    ],
    [
      34,
      "Private",
      263150,
      "Some-college",
      10,
      "Married-civ-spouse",
      "Exec-managerial",
      "Wife",
      "White",
      "Female",
      0,
      0,
      45,
      "United-States"
    ],
    [
      35,
      "Private",
      399601,
      "HS-grad",
      9,
      "Married-civ-spouse",
      "Prof-specialty",
      "Husband",
      "White",
      "Male",
      0,
      0,
      50,
      "United-States"
    ],
    [
      43,
      "Local-gov",
      256253,
      "Bachelors",
      13,
      "Married-civ-spouse",
      "Prof-specialty",
      "Husband",
      "White",
      "Male",
      0,
      0,
      55,
      "United-States"
    ],
    [
      42,
      "Federal-gov",
      88909,
      "Bachelors",
      13,
      "Married-civ-spouse",
      "Exec-managerial",
      "Husband",
      "White",
      "Male",
      0,
      0,
      40,
      "United-States"
    ],
    [
      18,
      "Private",
      150675,
      "10th",
      6,
      "Never-married",
      "Sales",
      "Own-child",
      "White",
      "Male",
      0,
      0,
      40,
      "United-States"
    ],
    [
      49,
      "Self-emp-inc",
      83444,
      "Bachelors",
      13,
      "Married-civ-spouse",
      "Sales",
      "Husband",
      "White",
      "Male",
      0,
      0,
      85,
      "United-States"
    ],
    [
      26,
      "?",
      88513,
      "Bachelors",
      13,
      "Never-married",
      "?",
      "Not-in-family",
      "White",
      "Male",
      0,
      0,
      40,
      "United-States"
    ],
    [
      47,
      "Self-emp-not-inc",
      185859,
      "HS-grad",
      9,
      "Married-civ-spouse",
      "Farming-fishing",
      "Husband",
      "White",
      "Male",
      3103,
      0,
      60,
      "United-States"
    ],
    [
      41,
      "?",
      188436,
      "HS-grad",
      9,
      "Married-civ-spouse",
      "?",
      "Husband",
      "White",
      "Male",
      0,
      0,
      20,
      "Canada"
    ],
    [
      30,
      "Private",
      183017,
      "HS-grad",
      9,
      "Divorced",
      "Machine-op-inspct",
      "Own-child",
      "White",
      "Male",
      0,
      0,
      40,
      "United-States"
    ],
    [
      26,
      "Local-gov",
      391074,
      "10th",
      6,
      "Never-married",
      "Handlers-cleaners",
      "Own-child",
      "Black",
      "Male",
      0,
      0,
      40,
      "United-States"
    ],
    [
      28,
      "Private",
      190525,
      "Bachelors",
      13,
      "Married-civ-spouse",
      "Exec-managerial",
      "Husband",
      "White",
      "Male",
      0,
      0,
      50,
      "United-States"
    ],
    [
      21,
      "Local-gov",
      402230,
      "Some-college",
      10,
      "Never-married",
      "Adm-clerical",
      "Unmarried",
      "White",
      "Male",
      0,
      0,
      36,
      "United-States"
    ],
    [
      64,
      "Private",
      186731,
      "HS-grad",
      9,
      "Widowed",
      "Adm-clerical",
      "Unmarried",
      "White",
      "Female",
      0,
      0,
      40,
      "United-States"
    ],
    [
      34,
      "Private",
      93213,
      "Masters",
      14,
      "Married-civ-spouse",
      "Other-service",
      "Husband",
      "White",
      "Male",
      0,
      0,
      30,
      "United-States"
    ],
    [
      31,
      "Private",
      323985,
      "HS-grad",
      9,
      "Married-civ-spouse",
      "Exec-managerial",
      "Wife",
      "White",
      "Female",
      0,
      0,
      40,
      "United-States"
    ],
    [
      44,
      "Private",
      98779,
      "Some-college",
      10,
      "Married-civ-spouse",
      "Craft-repair",
      "Husband",
      "White",
      "Male",
      5178,
      0,
      40,
      "United-States"
    ],
    [
      43,
      "Federal-gov",
      205675,
      "Some-college",
      10,
      "Married-civ-spouse",
      "Tech-support",
      "Husband",
      "White",
      "Male",
      0,
      0,
      75,
      "United-States"
    ],
    [
      29,
      "Private",
      197565,
      "HS-grad",
      9,
      "Married-civ-spouse",
      "Other-service",
      "Wife",
      "White",
      "Female",
      0,
      1902,
      35,
      "United-States"
    ]
  ],
  predicted_y: [
    1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1,
    0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1
  ],
  probability_y: [
    [0.7510962272030672, 0.24890377279693277],
    [0.7802282829948453, 0.21977171700515474],
    [0.780312141589862, 0.2196878584101381],
    [0.7013425216602426, 0.2986574783397574],
    [0.780312141589862, 0.2196878584101381],
    [0.6804143936790036, 0.3195856063209964],
    [0.780312141589862, 0.2196878584101381],
    [0.7067953367108348, 0.29320466328916517],
    [0.769711007366323, 0.23028899263367697],
    [0.769711007366323, 0.23028899263367697],
    [0.7729079584609388, 0.22709204153906115],
    [0.780312141589862, 0.2196878584101381],
    [0.7355988315726243, 0.2644011684273757],
    [0.780312141589862, 0.2196878584101381],
    [0.7510962272030672, 0.24890377279693277],
    [0.7802282829948453, 0.21977171700515474],
    [0.780312141589862, 0.2196878584101381],
    [0.6779519993905228, 0.32204800060947725],
    [0.7257604628145149, 0.27423953718548516],
    [0.7257604628145149, 0.27423953718548516],
    [0.7692638675777261, 0.2307361324222738],
    [0.780312141589862, 0.2196878584101381],
    [0.7729079584609388, 0.22709204153906115],
    [0.780312141589862, 0.2196878584101381],
    [0.7013425216602426, 0.2986574783397574],
    [0.780312141589862, 0.2196878584101381],
    [0.769711007366323, 0.23028899263367697],
    [0.780312141589862, 0.2196878584101381],
    [0.7549528655670701, 0.24504713443292986],
    [0.7575839691489974, 0.24241603085100258],
    [0.7575839691489974, 0.24241603085100258],
    [0.7067953367108348, 0.29320466328916517],
    [0.7013425216602426, 0.2986574783397574],
    [0.780312141589862, 0.2196878584101381],
    [0.7257604628145149, 0.27423953718548516],
    [0.7802282829948453, 0.21977171700515474],
    [0.7510962272030672, 0.24890377279693277],
    [0.767428653203549, 0.232571346796451],
    [0.780312141589862, 0.2196878584101381],
    [0.780312141589862, 0.2196878584101381],
    [0.7406302098400104, 0.25936979015998957],
    [0.780312141589862, 0.2196878584101381],
    [0.780312141589862, 0.2196878584101381],
    [0.754485107650303, 0.24551489234969706],
    [0.7575839691489974, 0.24241603085100258],
    [0.6779519993905228, 0.32204800060947725],
    [0.7355988315726243, 0.2644011684273757],
    [0.6804143936790036, 0.3195856063209964]
  ],
  target_column: "income",
  task_type: "classification",
  true_y: [
    1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1,
    0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1
  ]
};
