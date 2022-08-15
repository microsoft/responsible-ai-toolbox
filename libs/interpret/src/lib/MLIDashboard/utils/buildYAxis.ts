// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExplanationModelMetadata, ModelTypes } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

export function buildYAxis(
  metadata: IExplanationModelMetadata,
  selectedClass: number
): string {
  if (metadata.modelType === ModelTypes.Regression) {
    return localization.Interpret.IcePlot.prediction;
  }
  return `${
    localization.Interpret.IcePlot.predictedProbability
  }<br>${localization.formatString(
    localization.Interpret.WhatIfTab.classLabel,
    metadata.classNames[selectedClass]
  )}`;
}
