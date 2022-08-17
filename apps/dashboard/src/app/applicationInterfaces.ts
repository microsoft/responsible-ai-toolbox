// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IExplanationDashboardData,
  IFairnessData,
  ISerializedExplanationData,
  ITextExplanationDashboardData,
  IVisionExplanationDashboardData
} from "@responsible-ai/core-ui";
import { IModelAssessmentData } from "@responsible-ai/model-assessment";

export interface IInterpretDataSet {
  data: IExplanationDashboardData;
  classDimension?: 1 | 2 | 3;
}

export interface IInterpretTextDataSet {
  data: ITextExplanationDashboardData;
}

export interface IInterpretVisionDataSet {
  data: IVisionExplanationDashboardData;
}

export interface IFairnessDataSet {
  data: IFairnessData;
}

export interface IErrorAnalysisDataSet {
  data: IExplanationDashboardData | ISerializedExplanationData;
  classDimension?: 1 | 2 | 3;
}

export interface IModelAssessmentDataSet extends IModelAssessmentData {
  classDimension?: 1 | 2 | 3;
}

export interface IDataSet<TDataSet> {
  datasets: { [key: string]: TDataSet };
}

export interface IInterpretSetting {
  versions: { [key: string]: 1 | 2 };
}

export interface IInterpretTextSetting {
  versions: { [key: string]: 1 };
}

export interface IInterpretVisionSetting {
  versions: { [key: string]: 1 };
}

export interface IFairnessSetting {
  versions: { [key: string]: 2 };
}

export interface IErrorAnalysisSetting {
  versions: { [key: string]: 1 | 2 | 3 };
}

export interface IModelAssessmentSetting {
  versions: { [key: string]: 1 | 2 };
}
