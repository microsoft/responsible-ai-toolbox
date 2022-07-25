// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeDataBalance,
  modelAssessmentDatasetsIncludingFlights
} from "@responsible-ai/e2e";

const datasetShape =
  modelAssessmentDatasetsIncludingFlights.HousingDecisionMakingDataBalanceExperience;
describeDataBalance(datasetShape, "HousingDecisionMakingDataBalanceExperience");
