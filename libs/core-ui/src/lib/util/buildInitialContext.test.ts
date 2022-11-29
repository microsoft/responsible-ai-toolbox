// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDataset, DatasetTaskType } from "../Interfaces/IDataset";

import { ifEnableLargeData } from "./buildInitialContext";

const bostonDataset: IDataset = {
  categorical_features: ["CHAS"],
  feature_metadata: undefined,
  feature_names: [
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
  features: [
    [0.06724, 0, 3.24, 0, 0.46, 6.333, 17.2, 5.2146, 4, 430, 16.9, 375.21, 7.34]
  ],
  predicted_y: [24.91644033],
  task_type: DatasetTaskType.Regression,
  true_y: [22.6]
};

describe("Test ifEnableLargeData", () => {
  it("should return false", () => {
    expect(ifEnableLargeData(bostonDataset)).toBeFalsy();
  });
  it("should return true", () => {
    bostonDataset.is_large_data_scenario = true;
    bostonDataset.use_entire_test_data = true;
    expect(ifEnableLargeData(bostonDataset)).toBeTruthy();
  });
  it("should return false", () => {
    bostonDataset.is_large_data_scenario = true;
    bostonDataset.use_entire_test_data = false;
    expect(ifEnableLargeData(bostonDataset)).toBeFalsy();
  });
  it("should return false", () => {
    bostonDataset.is_large_data_scenario = false;
    bostonDataset.use_entire_test_data = false;
    expect(ifEnableLargeData(bostonDataset)).toBeFalsy();
  });
  it("should return false", () => {
    bostonDataset.is_large_data_scenario = false;
    bostonDataset.use_entire_test_data = true;
    expect(ifEnableLargeData(bostonDataset)).toBeFalsy();
  });
});
