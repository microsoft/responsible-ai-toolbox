// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeWhatIf,
  modelAssessmentDatasets
} from "@responsible-ai/rai-e2e";

const datasetShape =
  modelAssessmentDatasets["HousingClassificationModelDebugging"];
describeWhatIf(datasetShape, "HousingClassificationModelDebugging");
