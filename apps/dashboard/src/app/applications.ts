// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { adultCensus } from "../error-analysis/__mock_data__/adultCensus";
import { binaryClassification } from "../fairness/__mock_data__/binaryClassification";
import { binaryClassificationWithError } from "../fairness/__mock_data__/binaryClassificationWithError";
import { precomputedBinary } from "../fairness/__mock_data__/precomputedBinary";
import { precomputedBinaryMissingMetrics } from "../fairness/__mock_data__/precomputedBinaryMissingMetrics";
import { precomputedBinaryTwo } from "../fairness/__mock_data__/precomputedBinaryTwo";
import { precomputedBinaryWithError } from "../fairness/__mock_data__/precomputedBinaryWithError";
import { probability } from "../fairness/__mock_data__/probability";
import { regression } from "../fairness/__mock_data__/regression";
import { regressionWithError } from "../fairness/__mock_data__/regressionWithError";
import { emotionLongDoc } from "../interpret-text/__mock_data__/emotionLongDoc";
import { newsgroupBinaryData } from "../interpret-text/__mock_data__/newsgroupBinaryData";
import { automlMimicAdult } from "../interpret/__mock_data__/automlMimicAdult";
import { bostonData } from "../interpret/__mock_data__/bostonData";
import { bostonDataGlobal } from "../interpret/__mock_data__/bostonDataGlobal";
import { bostonDataNoDataset } from "../interpret/__mock_data__/bostonDataNoDataset";
import { bostonDataNoPredict } from "../interpret/__mock_data__/bostonDataNoPredict";
import { bostonDataNoY } from "../interpret/__mock_data__/bostonDataNoY";
import { breastCancerData } from "../interpret/__mock_data__/breastCancerData";
import { ebmData } from "../interpret/__mock_data__/ebmData";
import { ibmData } from "../interpret/__mock_data__/ibmData";
import { ibmDataInconsistent } from "../interpret/__mock_data__/ibmDataInconsistent";
import { ibmDataMissingValues } from "../interpret/__mock_data__/ibmDataMissingValues";
import { ibmNoClass } from "../interpret/__mock_data__/ibmNoClass";
import { irisData } from "../interpret/__mock_data__/irisData";
import { irisDataNoLocal } from "../interpret/__mock_data__/irisDataNoLocal";
import { irisGlobal } from "../interpret/__mock_data__/irisGlobal";
import { irisNoData } from "../interpret/__mock_data__/irisNoData";
import { irisNoFeatures } from "../interpret/__mock_data__/irisNoFeatures";
import { largeFeatureCount } from "../interpret/__mock_data__/largeFeatureCount";
import {
  emotion,
  emotionModelExplanationData
} from "../model-assessment-text/__mock_data__/emotion";
import { fridge } from "../model-assessment-vision/__mock_data__/fridge";
import { imagenet } from "../model-assessment-vision/__mock_data__/imagenet";
import {
  adultCensusWithFairnessDataset,
  adultCensusWithFairnessModelExplanationData,
  adultCensusCausalAnalysisData,
  adultCensusCausalErrorAnalysisData,
  adultCounterfactualData,
  adultCohortDataContinuous,
  adultCohortDataIndex,
  adultCohortDataCategorical,
  adultCohortDataClassificationOutcome,
  adultCohortDataPredictedY,
  adultCohortDataTrueY
} from "../model-assessment/__mock_data__/adultCensus";
import {
  bostonCensusCausalAnalysisData,
  bostonCounterfactualData,
  bostonData as bostonDataMAD,
  bostonErrorAnalysisData,
  bostonWithFairnessModelExplanationData,
  bostonCohortDataContinuous,
  bostonCohortDataCategorical,
  bostonCohortDataIndex,
  bostonCohortDataPredictedY,
  bostonCohortDataRegressionError,
  bostonCohortDataTrueY
} from "../model-assessment/__mock_data__/bostonData";
import {
  wineData as wineDataMAD,
  wineErrorAnalysisData,
  wineWithFairnessModelExplanationData,
  wineCohortDataContinuous,
  wineCohortDataPredictedY,
  wineCohortDataTrueY,
  wineCohortDataIndex
} from "../model-assessment/__mock_data__/wineData";

import {
  IFairnessSetting,
  IDataSet,
  IFairnessDataSet,
  IInterpretSetting,
  IInterpretDataSet,
  IInterpretTextSetting,
  IInterpretTextDataSet,
  IErrorAnalysisSetting,
  IErrorAnalysisDataSet,
  IModelAssessmentSetting,
  IModelAssessmentDataSet
} from "./applicationInterfaces";

export const applicationKeys = <const>[
  "interpret",
  "interpretText",
  "fairness",
  "errorAnalysis",
  "modelAssessment",
  "modelAssessmentText",
  "modelAssessmentVision"
];

export type IApplications = {
  [key in typeof applicationKeys[number]]: unknown;
} & {
  fairness: IFairnessSetting & IDataSet<IFairnessDataSet>;
  interpret: IInterpretSetting & IDataSet<IInterpretDataSet>;
  interpretText: IInterpretTextSetting & IDataSet<IInterpretTextDataSet>;
  errorAnalysis: IErrorAnalysisSetting & IDataSet<IErrorAnalysisDataSet>;
  modelAssessment: IModelAssessmentSetting & IDataSet<IModelAssessmentDataSet>;
  modelAssessmentText: IModelAssessmentSetting &
    IDataSet<IModelAssessmentDataSet>;
  modelAssessmentVision: IModelAssessmentSetting &
    IDataSet<IModelAssessmentDataSet>;
};

export const applications: IApplications = <const>{
  errorAnalysis: {
    datasets: {
      adultCensusIncomeData: { classDimension: 2, data: adultCensus },
      bostonData: { classDimension: 1, data: bostonData },
      breastCancerData: { classDimension: 2, data: breastCancerData },
      breastCancerPrecisionData: {
        classDimension: 2,
        data: breastCancerData
      },
      breastCancerRecallData: {
        classDimension: 2,
        data: breastCancerData
      }
    },
    versions: { "1": 1, "2:Static-View": 2 }
  },
  fairness: {
    datasets: {
      binaryClassification: {
        data: { ...binaryClassification, errorBarsEnabled: false }
      },
      binaryClassificationWithError: {
        data: binaryClassificationWithError
      },
      precomputedBinary: { data: precomputedBinary },
      precomputedBinaryMissingMetrics: {
        data: precomputedBinaryMissingMetrics
      },
      precomputedBinaryTwo: { data: precomputedBinaryTwo },
      precomputedBinaryWithError: { data: precomputedBinaryWithError },
      probability: { data: probability },
      regression: { data: regression },
      regressionWithError: { data: regressionWithError }
    },
    versions: { "Version-2": 2 }
  },
  interpret: {
    datasets: {
      automlMimicAdult: { data: automlMimicAdult },
      bostonData: { classDimension: 1, data: bostonData },
      bostonDataGlobal: { classDimension: 1, data: bostonDataGlobal },
      bostonDataNoDataset: { classDimension: 1, data: bostonDataNoDataset },
      bostonDataNoPredict: {
        classDimension: undefined,
        data: bostonDataNoPredict
      },
      bostonDataNoY: { classDimension: 1, data: bostonDataNoY },
      breastCancerData: { classDimension: 2, data: breastCancerData },
      ebmData: { classDimension: 2, data: ebmData },
      ibmData: { classDimension: 2, data: ibmData },
      ibmDataInconsistent: { classDimension: 2, data: ibmDataInconsistent },
      ibmDataMissingValues: { classDimension: 2, data: ibmDataMissingValues },
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
  interpretText: {
    datasets: {
      emotionLongDoc: { data: emotionLongDoc },
      newsgroupBinaryData: { data: newsgroupBinaryData }
    },
    versions: { "Version-1": 1 }
  },
  modelAssessment: {
    datasets: {
      adultCensusIncomeData: {
        causalAnalysisData: [adultCensusCausalAnalysisData],
        classDimension: 2,
        cohortData: [
          adultCohortDataContinuous,
          adultCohortDataIndex,
          adultCohortDataCategorical,
          adultCohortDataTrueY,
          adultCohortDataPredictedY,
          adultCohortDataClassificationOutcome
        ],
        counterfactualData: [adultCounterfactualData],
        dataset: adultCensusWithFairnessDataset,
        errorAnalysisData: [adultCensusCausalErrorAnalysisData],
        modelExplanationData: [adultCensusWithFairnessModelExplanationData]
      } as IModelAssessmentDataSet,
      adultCensusIncomeNoCausalData: {
        classDimension: 2,
        counterfactualData: [adultCounterfactualData],
        dataset: adultCensusWithFairnessDataset,
        errorAnalysisData: [adultCensusCausalErrorAnalysisData],
        modelExplanationData: [adultCensusWithFairnessModelExplanationData]
      } as IModelAssessmentDataSet,
      adultCensusIncomeNoCounterfactualData: {
        causalAnalysisData: [adultCensusCausalAnalysisData],
        classDimension: 2,
        dataset: adultCensusWithFairnessDataset,
        errorAnalysisData: [adultCensusCausalErrorAnalysisData],
        modelExplanationData: [adultCensusWithFairnessModelExplanationData]
      } as IModelAssessmentDataSet,
      adultCensusIncomeNoModelData: {
        classDimension: 2,
        dataset: adultCensusWithFairnessDataset
      } as IModelAssessmentDataSet,
      bostonData: {
        causalAnalysisData: [bostonCensusCausalAnalysisData],
        classDimension: 1,
        cohortData: [
          bostonCohortDataTrueY,
          bostonCohortDataCategorical,
          bostonCohortDataContinuous,
          bostonCohortDataIndex,
          bostonCohortDataRegressionError,
          bostonCohortDataPredictedY
        ],
        counterfactualData: [bostonCounterfactualData],
        dataset: bostonDataMAD,
        errorAnalysisData: [bostonErrorAnalysisData],
        modelExplanationData: [bostonWithFairnessModelExplanationData]
      } as IModelAssessmentDataSet,
      wineData: {
        classDimension: 3,
        cohortData: [
          wineCohortDataIndex,
          wineCohortDataPredictedY,
          wineCohortDataTrueY,
          wineCohortDataContinuous
        ],
        dataset: wineDataMAD,
        errorAnalysisData: [wineErrorAnalysisData],
        modelExplanationData: [wineWithFairnessModelExplanationData]
      } as IModelAssessmentDataSet
    },
    versions: { "1": 1, "2:Static-View": 2 }
  },
  modelAssessmentText: {
    datasets: {
      emotion: {
        classDimension: 3,
        dataset: emotion,
        modelExplanationData: [emotionModelExplanationData]
      } as IModelAssessmentDataSet
    },
    versions: { "1": 1, "2:Static-View": 2 }
  },
  modelAssessmentVision: {
    datasets: {
      fridge: {
        classDimension: 3,
        dataset: {
          categorical_features: fridge.categorical_features,
          class_names: fridge.class_names,
          feature_names: fridge.feature_names,
          features: fridge.features,
          images: fridge.images,
          predicted_y: fridge.predicted_y,
          task_type: fridge.task_type,
          true_y: fridge.true_y
        }
      },
      imagenet: {
        classDimension: 3,
        dataset: {
          categorical_features: imagenet.categorical_features,
          class_names: imagenet.class_names,
          feature_names: imagenet.feature_names,
          features: imagenet.features,
          images: imagenet.images,
          predicted_y: imagenet.predicted_y,
          task_type: imagenet.task_type,
          true_y: imagenet.true_y
        }
      } as IModelAssessmentDataSet
    },
    versions: { "1": 1, "2:Static-View": 2 }
  }
};
