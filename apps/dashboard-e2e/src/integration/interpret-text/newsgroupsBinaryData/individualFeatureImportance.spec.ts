// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { describeTextIndividualFeatureImportance } from "@responsible-ai/e2e";

import { interpretTextDatasets } from "../../../../src/describer/interpretText/interpretTextDatasets";

describeTextIndividualFeatureImportance(
  "newsgroupBinaryData",
  interpretTextDatasets.newsgroupBinaryData
);
