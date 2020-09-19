// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFairnessData } from "@responsible-ai/fairness";
import { IExplanationDashboardData } from "@responsible-ai/interpret";

import { binaryClassifier } from "../fairness/__mock_data__/binaryClassifier";
import { precomputedBinary } from "../fairness/__mock_data__/precomputedBinary";
import { precomputedBinaryTwo } from "../fairness/__mock_data__/precomputedBinaryTwo";
import { probit } from "../fairness/__mock_data__/probit";
import { regression } from "../fairness/__mock_data__/regression";
import { automlMimicAdult } from "../interpret/__mock_data__/automlMimicAdult";
import { bostonData } from "../interpret/__mock_data__/bostonData";
import { bostonDataGlobal } from "../interpret/__mock_data__/bostonDataGlobal";
import { breastCancerData } from "../interpret/__mock_data__/breastCancerData";
import { ebmData } from "../interpret/__mock_data__/ebmData";
import { ibmData } from "../interpret/__mock_data__/ibmData";
import { ibmDataInconsistent } from "../interpret/__mock_data__/ibmDataInconsistent";
import { ibmNoClass } from "../interpret/__mock_data__/ibmNoClass";
import { irisData } from "../interpret/__mock_data__/irisData";
import { irisDataGlobal } from "../interpret/__mock_data__/irisDataGlobal";
import { irisGlobal } from "../interpret/__mock_data__/irisGlobal";
import { irisNoData } from "../interpret/__mock_data__/irisNoData";
import { irisNoFeatures } from "../interpret/__mock_data__/irisNoFeatures";
import { largeFeatureCount } from "../interpret/__mock_data__/largeFeatureCount";

export interface IInterpretDataSet {
  data: IExplanationDashboardData;
  classDimension: number;
}

export interface IFairLearnDataSet {
  data: IFairnessData;
}

export interface IDataSet<TDataSet> {
  datasets: { [key: string]: TDataSet };
}

export interface IInterpretSetting {
  versions: { [key: string]: 1 | 2 };
}

export interface IFairLearnSetting {
  versions: { [key: string]: 1 | 2 };
}

export const applicationKeys = <const>["interpret", "fairness"];

export type IApplications = {
  [key in typeof applicationKeys[number]]: unknown;
} & {
  fairness: IFairLearnSetting & IDataSet<IFairLearnDataSet>;
  interpret: IInterpretSetting & IDataSet<IInterpretDataSet>;
};

export const applications: IApplications = <const>{
  interpret: {
    versions: { "Version-1": 1, "Version-2": 2 },
    datasets: {
      automlMimicAdult: { data: automlMimicAdult, classDimension: 3 },
      bostonData: { data: bostonData, classDimension: 1 },
      bostonDataGlobal: { data: bostonDataGlobal, classDimension: 1 },
      irisData: { data: irisData, classDimension: 3 },
      irisGlobal: { data: irisGlobal, classDimension: 3 },
      irisDataGlobal: { data: irisDataGlobal, classDimension: 3 },
      ibmData: { data: ibmData, classDimension: 2 },
      ibmDataInconsistent: { data: ibmDataInconsistent, classDimension: 2 },
      breastCancer: { data: breastCancerData, classDimension: 2 },
      ibmNoClass: { data: ibmNoClass, classDimension: 2 },
      irisNoFeature: { data: irisNoFeatures, classDimension: 3 },
      ebmData: { data: ebmData, classDimension: 2 },
      irisNoData: { data: irisNoData, classDimension: 3 },
      largeFeatureCount: { data: largeFeatureCount, classDimension: 2 }
    }
  },
  fairness: {
    versions: { "Version-1": 1, "Version-2": 2 },
    datasets: {
      binaryClassifier: { data: binaryClassifier },
      regression: { data: regression },
      probit: { data: probit },
      precomputedBinary: { data: precomputedBinary },
      precomputedBinaryTwo: { data: precomputedBinaryTwo }
    }
  }
};
