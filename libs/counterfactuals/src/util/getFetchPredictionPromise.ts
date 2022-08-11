// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JointDataset } from "@responsible-ai/core-ui";

export function getFetchPredictionPromise(
  fetchingReference: { [key: string]: any },
  jointDataset: JointDataset,
  invokeModel: (data: any[], abortSignal: AbortSignal) => Promise<any[]>
) {
  const abortController = new AbortController();
  const rawData = JointDataset.datasetSlice(
    fetchingReference,
    jointDataset.metaDict,
    jointDataset.datasetFeatureCount
  );
  const promise = invokeModel([rawData], abortController.signal);
  return promise;
}
