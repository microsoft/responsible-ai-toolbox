// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { calculateConfusionMatrixData } from "./calculateConfusionMatrixData";

describe("calculateConfusionMatrixData", () => {
  it.each`
    yTrue     | yPred     | labels                            | selectedLabels     | expectedResult
    ${[]}     | ${[]}     | ${[]}                             | ${undefined}       | ${{ confusionMatrix: [], selectedLabels: [] }}
    ${[0]}    | ${[0]}    | ${["categoryOne"]}                | ${undefined}       | ${{ confusionMatrix: [[1]], selectedLabels: ["categoryOne"] }}
    ${[1]}    | ${[0]}    | ${["categoryOne", "categoryTwo"]} | ${undefined}       | ${{ confusionMatrix: [[0, 0], [1, 0]], selectedLabels: ["categoryOne", "categoryTwo"] }}
    ${[1, 1]} | ${[0, 1]} | ${["categoryOne", "categoryTwo"]} | ${["categoryTwo"]} | ${{ confusionMatrix: [[1]], selectedLabels: ["categoryTwo"] }}
  `(
    "should return correct confusion matrix and labels",
    ({ yTrue, yPred, labels, selectedLabels, expectedResult }) => {
      const boxPlotData = calculateConfusionMatrixData(
        yTrue,
        yPred,
        labels,
        selectedLabels
      );
      if (boxPlotData !== undefined) {
        expect(boxPlotData.confusionMatrix).toEqual(
          expectedResult.confusionMatrix
        );
        expect(boxPlotData.selectedLabels).toEqual(
          expectedResult.selectedLabels
        );
      }
    }
  );
});
