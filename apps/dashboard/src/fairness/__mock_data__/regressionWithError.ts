// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFairnessData } from "@responsible-ai/core-ui";

import { regression } from "./regression";

export const regressionWithError: IFairnessData = {
  ...regression,
  errorBarsEnabled: true
};
