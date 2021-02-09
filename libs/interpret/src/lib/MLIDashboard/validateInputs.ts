// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  isThreeDimArray,
  isTwoDimArray,
  IExplanationModelMetadata
} from "@responsible-ai/core-ui";

import { IExplanationDashboardProps } from "./Interfaces/IExplanationDashboardProps";

function validLength(
  y: number[] | number[][] | number[][][] | undefined,
  length: number | undefined,
  fieldName: string
): void {
  if (y === undefined || length === undefined) {
    return;
  }
  if (!Array.isArray(y)) {
    throw new TypeError(`${fieldName} is not an array`);
  }
  if (y.length !== length) {
    throw new Error(
      `Inconsistent dimensions. ${fieldName} has dimension [${y.length}], expected [${length}]`
    );
  }
}
function validElementLength(
  y: number[][] | number[][][] | undefined,
  length: number | undefined,
  fieldName: string
): void {
  if (y === undefined || length === undefined) {
    return;
  }
  if (!Array.isArray(y)) {
    throw new TypeError(`${fieldName} is not an array`);
  }
  y?.forEach((row: number[] | number[][], idx: number) => {
    if (!Array.isArray(row)) {
      throw new TypeError(`${fieldName} ${idx} is not an array`);
    }
    if (row.length !== length) {
      throw new Error(
        `Inconsistent dimensions. ${fieldName} ${idx} has dimensions [${row.length}], expected [${length}]`
      );
    }
  });
}

export function validateInputs(
  props: IExplanationDashboardProps,
  modelMetadata: IExplanationModelMetadata
): string | undefined {
  try {
    const classLength = modelMetadata.classNames.length;
    const featureLength = modelMetadata.featureNames.length;
    const rowLength =
      props.trueY?.length ||
      props.predictedY?.length ||
      props.probabilityY?.length ||
      props.testData?.length;
    validLength(props.predictedY, rowLength, "Predicted Y");
    validLength(props.probabilityY, rowLength, "Predicted probability Y");
    validElementLength(
      props.probabilityY,
      classLength,
      "Predicted probability Y"
    );
    validLength(props.testData, rowLength, "Eval dataset");
    validElementLength(props.testData, featureLength, "Eval dataset");
    if (props.precomputedExplanations?.localFeatureImportance?.scores) {
      const localExp =
        props.precomputedExplanations.localFeatureImportance.scores;
      if (isThreeDimArray(localExp)) {
        validLength(localExp, classLength, "Local Explanation");
        validElementLength(localExp, rowLength, "Local Explanation");
        localExp.forEach((classArray, idx) =>
          validElementLength(
            classArray,
            featureLength,
            `Local Explanation ${idx}`
          )
        );
      } else if (isTwoDimArray(localExp)) {
        validLength(localExp, rowLength, "Local Explanation");
        validElementLength(localExp, featureLength, "Local Explanation");
      } else {
        throw new Error(
          "Invalid local explanation, expect 2d in case of regression models. 3d for classifier"
        );
      }
    }
  } catch (error) {
    return error.message;
  }
  return undefined;
}
