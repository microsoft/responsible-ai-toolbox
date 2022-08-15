// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JointDataset } from "@responsible-ai/core-ui";
import { IGlobalSeries } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";

export function getSelectedFeatureImportance(
  selectedPointsIndexes: number[],
  jointDataset: JointDataset
): IGlobalSeries[] {
  return selectedPointsIndexes.map((rowIndex, colorIndex) => {
    const row = jointDataset.getRow(rowIndex);
    return {
      colorIndex,
      id: rowIndex,
      name: localization.formatString(
        localization.Interpret.WhatIfTab.rowLabel,
        rowIndex.toString()
      ),
      unsortedAggregateY: JointDataset.localExplanationSlice(
        row,
        jointDataset.localExplanationFeatureCount
      ) as number[],
      unsortedFeatureValues: JointDataset.datasetSlice(
        row,
        jointDataset.metaDict,
        jointDataset.localExplanationFeatureCount
      )
    };
  });
}
