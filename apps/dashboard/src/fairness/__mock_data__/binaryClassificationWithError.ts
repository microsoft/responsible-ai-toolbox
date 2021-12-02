// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFairnessData } from "@responsible-ai/core-ui";

import { binaryClassification } from "./binaryClassification";

export const binaryClassificationWithError: IFairnessData = {
  ...binaryClassification,
  errorBarsEnabled: true
};
