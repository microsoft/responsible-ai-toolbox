// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { describeWhatIf, modelAssessmentDatasets } from "@responsible-ai/e2e";

const datasetShape = modelAssessmentDatasets.HousingDecisionMaking;
describeWhatIf(datasetShape, "HousingDecisionMaking");
