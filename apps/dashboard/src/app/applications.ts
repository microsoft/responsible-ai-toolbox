// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IExplanationDashboardData,
  ISerializedExplanationData,
  IFairnessData
} from "@responsible-ai/core-ui";
import { IModelAssessmentData } from "@responsible-ai/model-assessment";

import { adultCensus } from "../error-analysis/__mock_data__/adultCensus";
import { binaryClassification } from "../fairness/__mock_data__/binaryClassification";
import { precomputedBinary } from "../fairness/__mock_data__/precomputedBinary";
import { precomputedBinaryMissingMetrics } from "../fairness/__mock_data__/precomputedBinaryMissingMetrics";
import { precomputedBinaryTwo } from "../fairness/__mock_data__/precomputedBinaryTwo";
import { probability } from "../fairness/__mock_data__/probability";
import { regression } from "../fairness/__mock_data__/regression";
import { automlMimicAdult } from "../interpret/__mock_data__/automlMimicAdult";
import { bostonData } from "../interpret/__mock_data__/bostonData";
import { bostonDataGlobal } from "../interpret/__mock_data__/bostonDataGlobal";
import { bostonDataNoDataset } from "../interpret/__mock_data__/bostonDataNoDataset";
import { bostonDataNoY } from "../interpret/__mock_data__/bostonDataNoY";
import { breastCancerData } from "../interpret/__mock_data__/breastCancerData";
import { ebmData } from "../interpret/__mock_data__/ebmData";
import { ibmData } from "../interpret/__mock_data__/ibmData";
import { ibmDataInconsistent } from "../interpret/__mock_data__/ibmDataInconsistent";
import { ibmNoClass } from "../interpret/__mock_data__/ibmNoClass";
import { irisData } from "../interpret/__mock_data__/irisData";
import { irisDataNoLocal } from "../interpret/__mock_data__/irisDataNoLocal";
import { irisGlobal } from "../interpret/__mock_data__/irisGlobal";
import { irisNoData } from "../interpret/__mock_data__/irisNoData";
import { irisNoFeatures } from "../interpret/__mock_data__/irisNoFeatures";
import { largeFeatureCount } from "../interpret/__mock_data__/largeFeatureCount";
import {
  adultCensusWithFairnessDataset,
  adultCensusWithFairnessModelExplanationData,
  adultCensusCausalAnalysisData,
  adultCensusCausalErrorAnalysisConfig,
  adultCounterfactualData
} from "../model-assessment/__mock_data__/adultCensus";

export interface IInterpretDataSet {
  data: IExplanationDashboardData;
  classDimension?: 1 | 2 | 3;
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

export interface IFairnessSetting {
  versions: { [key: string]: 2 };
}

export interface IErrorAnalysisSetting {
  versions: { [key: string]: 1 | 2 | 3 };
}

export interface IModelAssessmentSetting {
  versions: { [key: string]: 1 };
}

export const applicationKeys = <const>[
  "interpret",
  "fairness",
  "errorAnalysis",
  "modelAssessment"
];

export type IApplications = {
  [key in typeof applicationKeys[number]]: unknown;
} & {
  fairness: IFairnessSetting & IDataSet<IFairnessDataSet>;
  interpret: IInterpretSetting & IDataSet<IInterpretDataSet>;
  errorAnalysis: IErrorAnalysisSetting & IDataSet<IErrorAnalysisDataSet>;
  modelAssessment: IModelAssessmentSetting & IDataSet<IModelAssessmentDataSet>;
};

export const applications: IApplications = <const>{
  errorAnalysis: {
    datasets: {
      adultCensusIncomeData: { classDimension: 2, data: adultCensus },
      bostonData: { classDimension: 1, data: bostonData },
      breastCancerData: { classDimension: 2, data: breastCancerData }
    },
    versions: { "1": 1, "2:Static-View": 2, "3:Live-Debug": 3 }
  },
  fairness: {
    datasets: {
      binaryClassification: { data: binaryClassification },
      precomputedBinary: { data: precomputedBinary },
      precomputedBinaryMissingMetrics: {
        data: precomputedBinaryMissingMetrics
      },
      precomputedBinaryTwo: { data: precomputedBinaryTwo },
      probability: { data: probability },
      regression: { data: regression }
    },
    versions: { "Version-2": 2 }
  },
  interpret: {
    datasets: {
      automlMimicAdult: { data: automlMimicAdult },
      bostonData: { classDimension: 1, data: bostonData },
      bostonDataGlobal: { classDimension: 1, data: bostonDataGlobal },
      bostonDataNoDataset: { classDimension: 1, data: bostonDataNoDataset },
      bostonDataNoPredict: { classDimension: undefined, data: bostonData },
      bostonDataNoY: { classDimension: 1, data: bostonDataNoY },
      breastCancerData: { classDimension: 2, data: breastCancerData },
      ebmData: { classDimension: 2, data: ebmData },
      ibmData: { classDimension: 2, data: ibmData },
      ibmDataInconsistent: { classDimension: 2, data: ibmDataInconsistent },
      ibmNoClass: { classDimension: 2, data: ibmNoClass },
      irisData: { classDimension: 3, data: irisData },
      irisDataNoLocal: { classDimension: 3, data: irisDataNoLocal },
      irisGlobal: { classDimension: 3, data: irisGlobal },
      irisNoData: { classDimension: 3, data: irisNoData },
      irisNoFeatures: { classDimension: 3, data: irisNoFeatures },
      largeFeatureCount: { classDimension: 2, data: largeFeatureCount }
    },
    versions: { "Version-1": 1, "Version-2": 2 }
  },
  modelAssessment: {
    datasets: {
      adultCensusIncomeData: {
        causalAnalysisData: [adultCensusCausalAnalysisData],
        classDimension: 2,
        counterfactualData: adultCounterfactualData,
        dataset: adultCensusWithFairnessDataset,
        errorAnalysisConfig: [adultCensusCausalErrorAnalysisConfig],
        modelExplanationData: [adultCensusWithFairnessModelExplanationData]
      } as IModelAssessmentDataSet
    },
    versions: { "Version-1": 1 }
  }
};
