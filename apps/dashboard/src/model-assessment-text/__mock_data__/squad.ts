// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DatasetTaskType, IDataset } from "@responsible-ai/core-ui";

export const squad: IDataset = {
  categorical_features: [],
  class_names: undefined,
  feature_names: [
    "context_positive_words",
    "context_negative_words",
    "context_negation_words",
    "context_negated_entities",
    "context_named_persons",
    "context_sentence_length",
    "question_positive_words",
    "question_negative_words",
    "question_negation_words",
    "question_negated_entities",
    "question_named_persons",
    "question_sentence_length"
  ],
  features: [
    [42, 0, 0, 0, 2, 695, 3, 0, 0, 0, 0, 71],
    [42, 0, 0, 0, 2, 695, 3, 0, 0, 0, 0, 49],
    [42, 0, 0, 0, 2, 695, 5, 0, 0, 0, 1, 76],
    [42, 0, 0, 0, 2, 695, 1, 0, 0, 0, 1, 33],
    [42, 0, 0, 0, 2, 695, 4, 0, 0, 0, 0, 52]
  ],
  predicted_y: [
    "Saint Bernadette Soubirous",
    "a copper statue of Christ",
    "the Main Building",
    "a Marian place of prayer and reflection",
    "a golden statue of the Virgin Mary"
  ],
  target_column: "answers",
  task_type: DatasetTaskType.QuestionAnswering,
  true_y: [
    "Saint Bernadette Soubirous",
    "a copper statue of Christ",
    "the Main Building",
    "a Marian place of prayer and reflection",
    "a golden statue of the Virgin Mary"
  ]
};
