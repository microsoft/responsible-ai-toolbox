// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFairnessData } from "@responsible-ai/core-ui";

import { precomputedBinary } from "./precomputedBinary";

// deep copy
const precomputedBinaryCopy = JSON.parse(JSON.stringify(precomputedBinary));

Object.assign(precomputedBinaryCopy, {
  ...precomputedBinary,
  precomputedMetrics: [
    // gender
    [
      // Model 1 metrics
      {
        accuracy_score: {
          bins: [0.75, 0.5, 0.25],
          bounds: { lower: 0.45, upper: 0.55 },
          global: 0.5
        },
        fallout_rate: {
          binBounds: [
            { lower: 0.23, upper: 0.33 },
            { lower: 0, upper: 0.1 },
            { lower: 0.23, upper: 0.27 }
          ],
          bins: [0.25, 0, 0.25],
          global: 0.16667
        },
        guid123: {
          bins: [0.9, 0.97, 0.83],
          global: 0.9
        },
        miss_rate: {
          binBounds: [
            { lower: 0, upper: 0 },
            { lower: 0.43, upper: 0.58 },
            { lower: 0.43, upper: 0.57 }
          ],
          bins: [0, 0.5, 0.5],
          global: 0.33333
        },
        overprediction: {
          bins: [0.25, 0, 0.25],
          global: 0.16667
        },
        selection_rate: {
          binBounds: [
            { lower: 0.45, upper: 0.55 },
            { lower: 0.7, upper: 0.8 },
            { lower: 0.2, upper: 0.3 }
          ],
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
          bounds: { lower: 0.65, upper: 0.68 },
          global: 0.66667
        },
        fallout_rate: {
          binBounds: [
            { lower: 0.43, upper: 0.58 },
            { lower: 0.95, upper: 1 },
            { lower: 0, upper: 0.1 }
          ],
          bins: [0.5, 1, 0],
          global: 0.08333
        },
        guid123: {
          bins: [0.8, 0.76, 0.84],
          global: 0.8
        },
        miss_rate: {
          binBounds: [
            { lower: 0, upper: 0 },
            { lower: 0.3, upper: 0.4 },
            { lower: 0, upper: 0.1 }
          ],
          bins: [0, 0.33333, 0],
          global: 0.25
        },
        overprediction: {
          bins: [0, 0, 0.25],
          global: 0.08333
        },
        selection_rate: {
          binBounds: [
            { lower: 0.42, upper: 0.58 },
            { lower: 0.7, upper: 0.8 },
            { lower: 0.23, upper: 0.27 }
          ],
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
          bounds: { lower: 0.65, upper: 0.68 },
          global: 0.66667
        },
        guid123: {
          bins: [0.85, 0.8, 0.75],
          global: 0.8
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
          bounds: { lower: 0.74, upper: 0.76 },
          global: 0.75
        },
        guid123: {
          bins: [0.92, 0.6, 0.73],
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
  ]
});

export const precomputedBinaryWithError: IFairnessData = precomputedBinaryCopy;
