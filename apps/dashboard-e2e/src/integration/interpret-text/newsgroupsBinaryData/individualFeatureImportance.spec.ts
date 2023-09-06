// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { interpretTextDatasets } from "../../../../src/describer/interpretText/interpretTextDatasets";
import { describeInterpretTextIndividualFeatureImportance } from "../../../describer/interpretText/describeInterpretTextIndividualFeatureImportance";

describeInterpretTextIndividualFeatureImportance(
  "newsgroupBinaryData",
  interpretTextDatasets.newsgroupBinaryData
);
