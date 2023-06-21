// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ModelMetadata } from "@responsible-ai/mlchartlib";

import {
  IMultiClassLocalFeatureImportance,
  ISingleClassLocalFeatureImportance,
  IExplanationModelMetadata
} from "../Interfaces/ExplanationInterfaces";
import { IFeatureMetaData } from "../Interfaces/IMetaData";

import { JointDataset } from "./JointDataset";

function getJointDatasetRegression(addFeatureMetaData: boolean): JointDataset {
  const features = [
    [
      0.06724, 0, 3.24, 0, 0.46, 6.333, 17.2, 5.2146, 4, 430, 16.9, 375.21, 7.34
    ],
    [9.2323, 0, 18.1, 1, 0.631, 6.216, 100, 1.1691, 24, 666, 20.2, 366.15, 9.53]
  ];
  const predictedY = [24.91644033, 25.08208277];
  const trueY = [22.6, 50];
  const localExplanations:
    | IMultiClassLocalFeatureImportance
    | ISingleClassLocalFeatureImportance
    | undefined = undefined;
  const featureIsCategorical = [
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false
  ];
  const featureRanges = ModelMetadata.buildFeatureRanges(
    features,
    featureIsCategorical
  );
  const modelMetadata = {
    classNames: ["Class 0"],
    featureIsCategorical,
    featureNames: [
      "CRIM",
      "ZN",
      "INDUS",
      "CHAS",
      "NOX",
      "RM",
      "AGE",
      "DIS",
      "RAD",
      "TAX",
      "PTRATIO",
      "B",
      "LSTAT"
    ],
    featureNamesAbridged: [
      "CRIM",
      "ZN",
      "INDUS",
      "CHAS",
      "NOX",
      "RM",
      "AGE",
      "DIS",
      "RAD",
      "TAX",
      "PTRATIO",
      "B",
      "LSTAT"
    ],
    featureRanges,
    modelType: "regression"
  } as IExplanationModelMetadata;

  const featureMetaData = {
    categorical_features: ["c1", "c2"],
    datetime_features: ["d1"],
    dropped_features: ["d3", "d4"],
    identity_feature_name: "INDUS"
  } as IFeatureMetaData;

  if (addFeatureMetaData) {
    const jointDataset = new JointDataset({
      dataset: features,
      featureMetaData,
      localExplanations,
      metadata: modelMetadata,
      predictedY,
      trueY
    });
    return jointDataset;
  }
  const jointDataset = new JointDataset({
    dataset: features,
    localExplanations,
    metadata: modelMetadata,
    predictedY,
    trueY
  });
  return jointDataset;
}

describe("Test JointDataset with and without feature metadata", () => {
  const mockJointDatasetWithFeatureMetaData = getJointDatasetRegression(true);
  const mockJointDatasetWithoutFeatureMetaData =
    getJointDatasetRegression(false);
  it("should set the dataset metadata within JointDataset", () => {
    expect(mockJointDatasetWithFeatureMetaData).toBeInstanceOf(JointDataset);
    expect(mockJointDatasetWithFeatureMetaData.datasetMetaData).toBeDefined();
  });
  it("should set the feature metadata within JointDataset dataset meta data", () => {
    expect(
      mockJointDatasetWithFeatureMetaData.datasetMetaData.featureMetaData
    ).toBeDefined();
  });
  it("should set categorical features", () => {
    expect(
      mockJointDatasetWithFeatureMetaData.datasetMetaData.featureMetaData
        .categorical_features
    ).toEqual(["c1", "c2"]);
  });
  it("should set datetime features", () => {
    expect(
      mockJointDatasetWithFeatureMetaData.datasetMetaData.featureMetaData
        ?.datetime_features[0]
    ).toEqual("d1");
  });
  it("should set dropped features", () => {
    expect(
      mockJointDatasetWithFeatureMetaData.datasetMetaData.featureMetaData
        .dropped_features
    ).toEqual(["d3", "d4"]);
  });
  it("should set identity feature name", () => {
    expect(
      mockJointDatasetWithFeatureMetaData.datasetMetaData.featureMetaData
        .identity_feature_name
    ).toEqual("INDUS");
  });
  it("should return the JointDataset internal feature name", () => {
    expect(
      mockJointDatasetWithFeatureMetaData.getJointDatasetFeatureName("INDUS")
    ).toEqual("Data2");
  });
  it("should return undefined as the JointDataset internal feature name", () => {
    expect(
      mockJointDatasetWithFeatureMetaData.getJointDatasetFeatureName("INDUS1")
    ).toEqual(undefined);
  });
  it("should not set the dataset metadata within JointDataset", () => {
    expect(mockJointDatasetWithoutFeatureMetaData).toBeInstanceOf(JointDataset);
    expect(
      mockJointDatasetWithoutFeatureMetaData.datasetMetaData
    ).toBeUndefined();
  });
});
