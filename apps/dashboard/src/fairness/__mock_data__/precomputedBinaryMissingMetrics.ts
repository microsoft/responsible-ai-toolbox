// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFairnessData, PredictionTypes } from "@responsible-ai/core-ui";

export const precomputedBinaryMissingMetrics: IFairnessData = {
  precomputedFeatureBins: [
    {
      binLabels: ["male", "female", "non-binary"],
      binVector: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2],
      featureBinName: "gender"
    },
    {
      binLabels: ["under 30", "30 to 45", "over 45"],
      binVector: [0, 1, 2, 0, 0, 1, 2, 1, 0, 1, 2, 2],
      featureBinName: "age"
    }
  ],

  precomputedMetrics: [
    // gender
    [
      // Model 1 metrics
      {
        accuracy_score: {
          bins: [0.75, 0.5, 0.25],
          global: 0.5
        },
        overprediction: {
          bins: [0.25, 0, 0.25],
          global: 0.16667
        },
        selection_rate: {
          bins: [0.5, 0.75, 0.25],
          global: 0.5
        },
        underprediction: {
          bins: [0, 0.5, 0.5],
          global: 0.33333
        }
      },
      // Model 2 metrics
      {
        accuracy_score: {
          bins: [0.75, 0.75, 0.5],
          global: 0.66667
        },
        overprediction: {
          bins: [0, 0, 0.25],
          global: 0.08333
        },
        selection_rate: {
          bins: [0.5, 0.75, 0.25],
          global: 0.5
        },
        underprediction: {
          bins: [0.25, 0.25, 0.25],
          global: 0.25
        }
      }
    ],
    // age
    [
      // Model 1 metrics
      {
        accuracy_score: {
          bins: [0.5, 0.75, 0.75],
          global: 0.66667
        },
        overprediction: {
          bins: [0, 0, 0.25],
          global: 0.08333
        },
        selection_rate: {
          bins: [0.5, 0.75, 0.25],
          global: 0.5
        },
        underprediction: {
          bins: [0.5, 0.25, 0],
          global: 0.25
        }
      },
      // Model 2 metrics
      {
        accuracy_score: {
          bins: [1, 0.5, 0.75],
          global: 0.75
        },
        overprediction: {
          bins: [0, 0.25, 0.25],
          global: 0.16667
        },
        selection_rate: {
          bins: [0.75, 0.75, 0.25],
          global: 0.66667
        },
        underprediction: {
          bins: [0, 0.25, 0],
          global: 0.08333
        }
      }
    ]
  ],

  predictedY: [
    [1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0],
    [1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0]
  ],

  predictionType: PredictionTypes.BinaryClassification,

  trueY: [1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0]
};
