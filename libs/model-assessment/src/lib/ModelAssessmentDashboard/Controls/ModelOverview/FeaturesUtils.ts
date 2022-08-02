// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

import { IFeatureConfigurationRow } from "./FeatureConfigurationFlyout";

export function shortFeatureGroups(items: IFeatureConfigurationRow[]) {
  // if feature groups is more than 10, keep the top 10 groups, for the rest show as Other
  items.forEach((item) => {
    if (item.groups.length > 10) {
      const groups = item.groups.slice(0, 10);
      groups.push(localization.ModelAssessment.ModelOverview.other);
      item.groups = groups;
    }
  });
  return items;
}
