// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  CohortSource,
  ErrorCohort,
  IDataset,
  IExplanationModelMetadata,
  JointDataset,
  MetricCohortStats
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { ModelMetadata } from "@responsible-ai/mlchartlib";

import { generateTimeSeriesCohorts } from "./GenerateTimeSeriesCohorts";

const features = [
  [1, "test1", 1],
  [1, "test1", 1.1],
  [1, "test1", 1.2],
  [1, "test1", 1.3],
  [2, "test1", 1],
  [2, "test1", 1.1],
  [2, "test1", 1.2],
  [2, "test1", 1.3],
  [1, "test2", 1],
  [1, "test2", 1.1],
  [1, "test2", 1.2],
  [1, "test2", 1.3]
];
const predictedY = [1, 2, 2.5, 4, 1.5, 2, 3, 4, 1, 2, 3.3, 4];
const trueY = [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4];
const featureIsCategorical = [true, true, false];
const featureRanges = ModelMetadata.buildFeatureRanges(
  features,
  featureIsCategorical
);
const featureNames = ["A", "B", "C"];
const modelMetadata = {
  featureIsCategorical,
  featureNames,
  featureNamesAbridged: featureNames,
  featureRanges,
  modelType: "forecasting"
} as IExplanationModelMetadata;

const jointDataset = new JointDataset({
  dataset: features,
  metadata: modelMetadata,
  predictedY,
  trueY
});

const dataset = {
  categorical_features: ["A", "B"],
  feature_metadata: {
    categorical_features: ["A", "B"],
    time_series_id_features: ["A", "B"]
  },
  feature_names: featureNames,
  features,
  task_type: "forecasting",
  true_y: trueY
} as IDataset;

const metricStats = new MetricCohortStats(12, 12, 0.5, "test_metric", 1);

const defaultCohort = new ErrorCohort(
  new Cohort(localization.ErrorAnalysis.Cohort.defaultLabel, jointDataset, []),
  jointDataset,
  0,
  CohortSource.Prebuilt,
  false,
  metricStats,
  true
);

describe("Generate time series cohorts from time series ID features", () => {
  it("should create cohorts for dataset", () => {
    const cohorts = generateTimeSeriesCohorts(
      defaultCohort,
      [],
      dataset,
      jointDataset
    );
    expect(cohorts.length).toBe(3);
    cohorts.forEach((cohort) => {
      expect(cohort.cohort.filters.length).toBe(2);
      expect(cohort.cohort.filters[0].column).toBe("Data0");
      expect(cohort.cohort.filters[1].column).toBe("Data1");
    });
  });
});
