// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JointDataset, ModelExplanationUtils } from "@responsible-ai/core-ui";
import { IGlobalSeries } from "@responsible-ai/interpret";
import _ from "lodash";

import { getSelectedFeatureImportance } from "./getSelectedFeatureImportance";

export function getSortArrayAndIndex(
  sortArray: number[],
  selectedPointsIndexes: number[],
  prevSelectedPointsIndexes: number[],
  weightVectorsAreEqual: boolean,
  selectedFeatureImportance: IGlobalSeries[],
  jointDataset: JointDataset,
  sortingSeriesIndex?: number
): [number[], number | undefined, IGlobalSeries[]] {
  const selectionsAreEqual = _.isEqual(
    selectedPointsIndexes,
    prevSelectedPointsIndexes
  );
  if (!selectionsAreEqual || !weightVectorsAreEqual) {
    selectedFeatureImportance = getSelectedFeatureImportance(
      selectedPointsIndexes,
      jointDataset
    );
    if (
      sortingSeriesIndex === undefined ||
      !selectedPointsIndexes.includes(sortingSeriesIndex)
    ) {
      if (selectedPointsIndexes.length !== 0) {
        sortingSeriesIndex = 0;
        sortArray = ModelExplanationUtils.getSortIndices(
          selectedFeatureImportance[0].unsortedAggregateY
        ).reverse();
      } else {
        sortingSeriesIndex = undefined;
      }
    } else if (!weightVectorsAreEqual) {
      sortArray = ModelExplanationUtils.getSortIndices(
        selectedFeatureImportance[0].unsortedAggregateY
      ).reverse();
    }
  }
  return [sortArray, sortingSeriesIndex, selectedFeatureImportance];
}
