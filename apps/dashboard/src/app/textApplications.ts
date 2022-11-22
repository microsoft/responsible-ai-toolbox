// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { emotionLongDoc } from "../interpret-text/__mock_data__/emotionLongDoc";
import { newsgroupBinaryData } from "../interpret-text/__mock_data__/newsgroupBinaryData";
import {
  blbooksgenre,
  blbooksgenreModelExplanationData
} from "../model-assessment-text/__mock_data__/blbooksgenre";
import {
  emotion,
  emotionModelExplanationData
} from "../model-assessment-text/__mock_data__/emotion";

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
      emotion: {
        classDimension: 3,
        dataset: emotion,
        modelExplanationData: [emotionModelExplanationData]
      } as IModelAssessmentDataSet
    },
    versions: { "1": 1, "2:Static-View": 2 }
  }
};
