// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JointDataset } from "@responsible-ai/core-ui";
import _ from "lodash";

export function getFetchPredictionPromise(
  fetchingReference: { [key: string]: any },
  jointDataset: JointDataset,
  invokeModel: (data: any[], abortSignal: AbortSignal) => Promise<any[]>,
  testData?: any[],
  ifEnableLargeData?: boolean
): Promise<any[]> {
  const abortController = new AbortController();
  let rawData = [
    JointDataset.datasetSlice(
      fetchingReference,
      jointDataset.metaDict,
      jointDataset.datasetFeatureCount
    )
  ];
  if (ifEnableLargeData && testData) {
    const tempTestData = _.cloneDeep(testData);
    tempTestData[0][0].pop(); // drop the prediction value before predict call
    rawData = tempTestData[0];
  }

  const promise = invokeModel(rawData, abortController.signal);
  return promise;
}
