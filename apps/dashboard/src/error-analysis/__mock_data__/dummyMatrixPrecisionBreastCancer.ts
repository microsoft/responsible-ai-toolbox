// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const dummyMatrixPrecisionBreastCancer = {
  category1: {
    intervalMax: [
      10.1525, 12.576, 14.9995, 17.423000000000002, 19.846500000000002, 22.27
    ],
    intervalMin: [
      7.714458999999999, 10.1525, 12.576, 14.9995, 17.423000000000002,
      19.846500000000002
    ],
    values: [
      "(7.714458999999999, 10.1525]",
      "(10.1525, 12.576]",
      "(12.576, 14.9995]",
      "(14.9995, 17.423000000000002]",
      "(17.423000000000002, 19.846500000000002]",
      "(19.846500000000002, 22.27]"
    ]
  },
  matrix: [
    [
      {
        count: 15,
        error: 0,
        fn: [0],
        fp: [0],
        metricName: "Precision score",
        metricValue: 1,
        tn: [0],
        tp: [15]
      },
      {
        count: 25,
        error: 1,
        fn: [0],
        fp: [1],
        metricName: "Precision score",
        metricValue: 0.96,
        tn: [0],
        tp: [24]
      },
      {
        count: 33,
        error: 7,
        fn: [0],
        fp: [7],
        metricName: "Precision score",
        metricValue: 0.7878787878787878,
        tn: [0],
        tp: [26]
      },
      {
        count: 19,
        error: 17,
        fn: [0],
        fp: [17],
        metricName: "Precision score",
        metricValue: 0.10526315789473684,
        tn: [0],
        tp: [2]
      },
      {
        count: 11,
        error: 11,
        fn: [0],
        fp: [11],
        metricName: "Precision score",
        metricValue: 0,
        tn: [0],
        tp: [0]
      },
      {
        count: 11,
        error: 11,
        fn: [0],
        fp: [11],
        metricName: "Precision score",
        metricValue: 0,
        tn: [0],
        tp: [0]
      }
    ]
  ]
};
