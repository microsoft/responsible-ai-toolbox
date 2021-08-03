// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExplanationDashboardProps } from "../Interfaces/IExplanationDashboardProps";

export function getClassLength(props: IExplanationDashboardProps): number {
  if (
    props.precomputedExplanations &&
    props.precomputedExplanations.localFeatureImportance &&
    props.precomputedExplanations.localFeatureImportance.scores
  ) {
    const localImportances =
      props.precomputedExplanations.localFeatureImportance.scores;
    if (
      (localImportances as number[][][]).every((dim1) => {
        return dim1.every((dim2) => Array.isArray(dim2));
      })
    ) {
      return localImportances.length;
    }
    // 2d is regression (could be a non-scikit convention binary, but that is not supported)
    return 1;
  }
  if (
    props.precomputedExplanations &&
    props.precomputedExplanations.globalFeatureImportance &&
    props.precomputedExplanations.globalFeatureImportance.scores
  ) {
    // determine if passed in values is 1D or 2D
    if (
      (
        props.precomputedExplanations.globalFeatureImportance
          .scores as number[][]
      ).every((dim1) => Array.isArray(dim1))
    ) {
      return (
        props.precomputedExplanations.globalFeatureImportance
          .scores as number[][]
      )[0].length;
    }
  }
  if (
    props.probabilityY &&
    Array.isArray(props.probabilityY) &&
    Array.isArray(props.probabilityY[0]) &&
    props.probabilityY[0].length > 0
  ) {
    return props.probabilityY[0].length;
  }
  // default to regression case
  return 1;
}
