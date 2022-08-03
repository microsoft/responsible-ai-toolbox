// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFeatureConfigurationRow } from "./FeatureConfigurationFlyout";
import { shortFeatureGroups } from "./FeaturesUtils";

describe("FeaturesUtils", () => {
  it("should show top 10 groups with Other for the rest", () => {
    const items: IFeatureConfigurationRow[] = [
      {
        continuousFeatureBinningEnabled: false,
        featureName: "education",
        featureRemark: "This feature has 12 unique values.",
        groups: [
          "occupation in ?",
          "occupation in Adm-clerical",
          "occupation in Craft-repair",
          "occupation in Exec-managerial",
          "occupation in Handlers-cleaners",
          "occupation in Machine-op-inspct",
          "occupation in Other-service",
          "occupation in Prof-specialty",
          "occupation in Sales",
          "occupation in Farming",
          "occupation in Fishing",
          "occupation in Tech"
        ],
        key: "0"
      }
    ];
    const expectedItems: IFeatureConfigurationRow[] = [
      {
        continuousFeatureBinningEnabled: false,
        featureName: "education",
        featureRemark: "This feature has 12 unique values.",
        groups: [
          "occupation in ?",
          "occupation in Adm-clerical",
          "occupation in Craft-repair",
          "occupation in Exec-managerial",
          "occupation in Handlers-cleaners",
          "occupation in Machine-op-inspct",
          "occupation in Other-service",
          "occupation in Prof-specialty",
          "occupation in Sales",
          "occupation in Farming",
          "Other"
        ],
        key: "0"
      }
    ];
    expect(shortFeatureGroups(items)).toEqual(expectedItems);
  });

  it("should show full list of groups when groups number is less or equal than 10", () => {
    const items: IFeatureConfigurationRow[] = [
      {
        continuousFeatureBinningEnabled: false,
        featureName: "education",
        featureRemark: "This feature has 10 unique values.",
        groups: [
          "occupation in ?",
          "occupation in Adm-clerical",
          "occupation in Craft-repair",
          "occupation in Exec-managerial",
          "occupation in Handlers-cleaners",
          "occupation in Machine-op-inspct",
          "occupation in Other-service",
          "occupation in Prof-specialty",
          "occupation in Sales",
          "occupation in Farming"
        ],
        key: "0"
      }
    ];
    expect(shortFeatureGroups(items)).toEqual(items);
  });
});
