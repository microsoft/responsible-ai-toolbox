// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JointDataset } from "@responsible-ai/core-ui";
import { Dictionary } from "lodash";

export function getPredictedProbabilities(
  fetchingReference: {
    [key: string]: any;
  },
  fetchedData: any[]
): Dictionary<any> {
  const predictionVector = fetchedData[0];
  let predictedClass = 0;
  let maxProb = Number.MIN_SAFE_INTEGER;
  for (const [i, element] of predictionVector.entries()) {
    fetchingReference[JointDataset.ProbabilityYRoot + i.toString()] = element;
    if (element > maxProb) {
      predictedClass = i;
      maxProb = element;
    }
  }
  fetchingReference[JointDataset.PredictedYLabel] = predictedClass;
  return fetchingReference;
}
