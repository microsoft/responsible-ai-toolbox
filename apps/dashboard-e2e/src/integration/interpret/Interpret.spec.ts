// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AggregateFeatureImportanceDescriber } from "./aggregateFeatureImportance/AggregateFeatureImportanceDescriber";
interface IInterpretData {
  totalFeatures: number;
}
const datasets: { [key: string]: IInterpretData } = {
  automlMimicAdult: {
    totalFeatures: 14
  },
  bostonData: {
    totalFeatures: 13
  },
  bostonDataGlobal: {
    totalFeatures: 13
  },
  breastCancerData: {
    totalFeatures: 30
  },
  ebmData: {
    totalFeatures: 2
  },
  ibmData: {
    totalFeatures: 30
  },
  ibmDataInconsistent: {
    totalFeatures: 30
  },
  ibmNoClass: {
    totalFeatures: 30
  },
  irisData: {
    totalFeatures: 4
  },
  irisDataGlobal: {
    totalFeatures: 4
  },
  irisGlobal: {
    totalFeatures: 4
  },
  irisNoData: {
    totalFeatures: 4
  },
  irisNoFeatures: {
    totalFeatures: 4
  },
  largeFeatureCount: {
    totalFeatures: 14
  }
};
for (const name of Object.keys(datasets)) {
  const aggregateFeatureImportanceDescriber = new AggregateFeatureImportanceDescriber(
    name,
    {
      totalFeatures: datasets[name].totalFeatures
    }
  );
  describe(name, () => {
    aggregateFeatureImportanceDescriber.describeTabHeader();
    aggregateFeatureImportanceDescriber.describeGlobalExplanationChart();
  });
}
