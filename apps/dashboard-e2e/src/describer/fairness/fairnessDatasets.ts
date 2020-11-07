// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFairnessData } from "./IFairnessData";

const fairnessDatasets = {
  binaryClassification: {}
};
const withType: {
  [key in keyof typeof fairnessDatasets]: IFairnessData;
} = fairnessDatasets;

export { withType as fairnessDatasets };
