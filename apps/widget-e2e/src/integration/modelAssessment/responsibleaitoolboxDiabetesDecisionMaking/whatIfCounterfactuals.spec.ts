// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeWhatIf,
  modelAssessmentDatasets
} from "@responsible-ai/rai-e2e";

const datasetShape = modelAssessmentDatasets.DiabetesDecisionMaking;
describeWhatIf(datasetShape, "DiabetesDecisionMaking");
