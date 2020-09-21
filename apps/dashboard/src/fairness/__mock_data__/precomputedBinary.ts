// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFairnessData, PredictionTypes } from "@responsible-ai/fairness";

export const precomputedBinary: IFairnessData = {
  // feel free to come up with a better name
  customMetrics: [
    {
      description:
        "Measure profitability of company using model vs not using model",
      id: "guid123",
      name: "the best metric"
      // how would a function be in here???
    }
  ],

  precomputedFeatureBins: [
    {
      binLabels: ["thing 1", "thing 2"],
      binVector: [1, 0, 1, 1, 0, 1, 0, 0],
      featureBinName: "thingfulness"
    },
    {
      binLabels: ["State A", "State B", "State C"],
      binVector: [1, 2, 0, 1, 2, 0, 1, 2],
      featureBinName: "serious real feature"
    }
  ],

  precomputedMetrics: [
    [
      // Model 1 metrics
      {
        accuracy_score: {
          bins: [0.2, 0.8],
          global: 0.5
        },
        guid123: {
          bins: [0.2, 0.22],
          global: 0.2
        },
        overprediction: {
          bins: [0.2, 0.8],
          global: 0.5
        },
        selection_rate: {
          bins: [0.2, 0.8],
          global: 0.5
        },
        underprediction: {
          bins: [0.2, 0.8],
          global: 0.5
        }
      },
      // Model 2 metrics
      {
        accuracy_score: {
          bins: [0.2, 0.8],
          global: 0.6
        },
        guid123: {
          bins: [0.2, 0.22],
          global: 0.2
        },
        overprediction: {
          bins: [0.2, 0.8],
          global: 0.5
        },
        selection_rate: {
          bins: [0.2, 0.8],
          global: 0.5
        },
        underprediction: {
          bins: [0.2, 0.8],
          global: 0.5
        }
      }
    ],
    // Feature 2, serious real feature
    [
      // Model 1 metrics
      {
        accuracy_score: {
          bins: [0.2, 0.8, 0.44],
          global: 0.5
        },
        guid123: {
          bins: [0.2, 0.22, 0.18],
          global: 0.2
        },
        overprediction: {
          bins: [0.2, 0.8, 0.44],
          global: 0.5
        },
        selection_rate: {
          bins: [0.2, 0.8, 0.44],
          global: 0.5
        },
        underprediction: {
          bins: [0.2, 0.8, 0.44],
          global: 0.5
        }
      },
      // Model 2 metrics
      {
        accuracy_score: {
          bins: [0.2, 0.8, 0.44],
          global: 0.6
        },
        guid123: {
          bins: [0.2, 0.22, 0.18],
          global: 0.2
        },
        overprediction: {
          bins: [0.2, 0.8, 0.44],
          global: 0.5
        },
        selection_rate: {
          bins: [0.2, 0.8, 0.44],
          global: 0.5
        },
        underprediction: {
          bins: [0.2, 0.8, 0.44],
          global: 0.5
        }
      }
    ]
  ],

  predictedY: [
    [1, 0, 0, 1, 1, 1, 1, 0],
    [1, 0, 1, 1, 1, 0, 0, 0]
  ],

  predictionType: PredictionTypes.BinaryClassification,

  trueY: [1, 0, 1, 1, 0, 1, 0, 0]
};
