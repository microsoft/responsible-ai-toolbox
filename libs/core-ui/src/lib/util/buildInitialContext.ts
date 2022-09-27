// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import memoize from "memoize-one";

import { IPrecomputedExplanations } from "../Interfaces/ExplanationInterfaces";
import { ModelTypes } from "../Interfaces/IExplanationContext";
import { IGlobalExplanationProps } from "../Interfaces/IGlobalExplanationProps";
import { Method } from "../Interfaces/IModelExplanationData";

import { isThreeDimArray, isTwoDimArray } from "./array";

export function buildGlobalProperties(
  precomputedExplanations?: IPrecomputedExplanations
): IGlobalExplanationProps {
  const result: IGlobalExplanationProps = {} as IGlobalExplanationProps;
  if (
    precomputedExplanations &&
    precomputedExplanations.globalFeatureImportance &&
    precomputedExplanations.globalFeatureImportance.scores
  ) {
    result.isGlobalImportanceDerivedFromLocal = false;
    if (isTwoDimArray(precomputedExplanations.globalFeatureImportance.scores)) {
      result.globalImportance = precomputedExplanations.globalFeatureImportance
        .scores as number[][];
      result.globalImportanceIntercept = precomputedExplanations
        .globalFeatureImportance.intercept as number[];
    } else {
      result.globalImportance = (
        precomputedExplanations.globalFeatureImportance.scores as number[]
      ).map((value) => [value]);
      result.globalImportanceIntercept = [
        precomputedExplanations.globalFeatureImportance.intercept as number
      ];
    }
  }
  return result;
}

export function buildIndexedNames(
  length: number,
  baseString: string
): string[] {
  return [...new Array(length).keys()].map(
    (i) => localization.formatString(baseString, i.toString()) as string
  );
}

export const getClassLength: (
  precomputedExplanations?: IPrecomputedExplanations,
  probabilityY?: number[][]
) => number = memoize(
  (
    precomputedExplanations?: IPrecomputedExplanations,
    probabilityY?: number[][]
  ) => {
    if (
      precomputedExplanations &&
      precomputedExplanations.localFeatureImportance &&
      precomputedExplanations.localFeatureImportance.scores
    ) {
      const localImportances =
        precomputedExplanations.localFeatureImportance.scores;
      if (isThreeDimArray(localImportances)) {
        return localImportances.length;
      }
      // 2d is regression (could be a non-scikit convention binary, but that is not supported)
      return 1;
    }
    if (
      precomputedExplanations &&
      precomputedExplanations.globalFeatureImportance &&
      precomputedExplanations.globalFeatureImportance.scores
    ) {
      // determine if passed in values is 1D or 2D
      if (
        isTwoDimArray(precomputedExplanations.globalFeatureImportance.scores)
      ) {
        return (
          precomputedExplanations.globalFeatureImportance.scores as number[][]
        ).length;
      }
    }
    if (
      probabilityY &&
      Array.isArray(probabilityY) &&
      Array.isArray(probabilityY[0]) &&
      probabilityY[0].length > 0
    ) {
      return probabilityY[0].length;
    }
    // default to regression case
    return 1;
  }
);

export function getModelType(
  method?: Method,
  precomputedExplanations?: IPrecomputedExplanations,
  probabilityY?: number[][]
): ModelTypes {
  // If Python provides a hint, use it!
  if (method) {
    if (method === ModelTypes.Regression.valueOf() || method === "regressor") {
      return ModelTypes.Regression;
    } else if (method === ModelTypes.Binary.valueOf()) {
      return ModelTypes.Binary;
    } else if (method === ModelTypes.Multiclass.valueOf()) {
      return ModelTypes.Multiclass;
    } else if (method === "imageclassifier") {
      // TODO: split this into binary/multiclass once we support binary
      return ModelTypes.ImageMulticlass;
    } else if (method === "textclassifier") {
      // TODO: split this into binary/multiclass once we support binary
      return ModelTypes.TextMulticlass;
    }
  }
  switch (getClassLength(precomputedExplanations, probabilityY)) {
    case 1:
      return ModelTypes.Regression;
    case 2:
      return ModelTypes.Binary;
    default:
      return ModelTypes.Multiclass;
  }
}
