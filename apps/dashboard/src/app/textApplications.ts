// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { dbpediaLongDoc } from "../interpret-text/__mock_data__/dbpediaLongDoc";
import { emotionLongDoc } from "../interpret-text/__mock_data__/emotionLongDoc";
import { newsgroupBinaryData } from "../interpret-text/__mock_data__/newsgroupBinaryData";
import {
  blbooksgenre,
  blbooksgenreModelExplanationData
} from "../model-assessment-text/__mock_data__/blbooksgenre";
import {
  covid19events,
  covidEventsErrorAnalysisData
} from "../model-assessment-text/__mock_data__/covidevents";
import {
  emotion,
  emotionModelExplanationData
} from "../model-assessment-text/__mock_data__/emotion";
import { squad } from "../model-assessment-text/__mock_data__/squad";

import {
  IDataSet,
  IInterpretTextSetting,
  IInterpretTextDataSet,
  IModelAssessmentSetting,
  IModelAssessmentDataSet
} from "./applicationInterfaces";

export const applicationKeys = <const>["interpretText", "modelAssessmentText"];

export type ITextApplications = {
  [key in typeof applicationKeys[number]]: unknown;
} & {
  interpretText: IInterpretTextSetting & IDataSet<IInterpretTextDataSet>;
  modelAssessmentText: IModelAssessmentSetting &
    IDataSet<IModelAssessmentDataSet>;
};

export const textApplications: ITextApplications = <const>{
  interpretText: {
    datasets: {
      dbpediaLongDoc: { data: dbpediaLongDoc },
      emotionLongDoc: { data: emotionLongDoc },
      newsgroupBinaryData: { data: newsgroupBinaryData }
    },
    versions: { "Version-1": 1 }
  },
  modelAssessmentText: {
    datasets: {
      blbooksgenre: {
        classDimension: 3,
        dataset: blbooksgenre,
        modelExplanationData: [blbooksgenreModelExplanationData]
      } as IModelAssessmentDataSet,
      covid19events: {
        classDimension: 3,
        dataset: covid19events,
        errorAnalysisData: [covidEventsErrorAnalysisData]
      } as IModelAssessmentDataSet,
      emotion: {
        classDimension: 3,
        dataset: emotion,
        modelExplanationData: [emotionModelExplanationData]
      } as IModelAssessmentDataSet,
      squad: {
        classDimension: 3,
        dataset: squad
      } as IModelAssessmentDataSet
    },
    versions: { "1": 1, "2:Static-View": 2 }
  }
};
