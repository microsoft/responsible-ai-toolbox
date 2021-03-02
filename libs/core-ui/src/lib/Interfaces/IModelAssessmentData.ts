// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDataset } from "./IDataset";
import { IModelExplanationData } from "./IModelExplanationData";

export interface IModelAssessmentDashboardData {
    dataset: IDataset;
    modelExplanationData: IModelExplanationData;
}
