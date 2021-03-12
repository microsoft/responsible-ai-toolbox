// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import { IDataset, IModelExplanationData } from "@responsible-ai/core-ui";

export interface IModelAssessmentContext {
  dataset: IDataset;
  modelExplanationData: IModelExplanationData;
}

export const defaultModelAssessmentContext: IModelAssessmentContext = {
  dataset: {} as IDataset,
  modelExplanationData: {} as IModelExplanationData
};
const modelAssessmentContext = React.createContext<IModelAssessmentContext>(
  defaultModelAssessmentContext
);
export { modelAssessmentContext as ModelAssessmentContext };
