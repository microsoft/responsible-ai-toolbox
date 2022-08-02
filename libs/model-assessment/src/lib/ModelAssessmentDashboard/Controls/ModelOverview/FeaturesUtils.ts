import { localization } from "@responsible-ai/localization";
import { IFeatureConfigurationRow } from "./FeatureConfigurationFlyout";

export function shortFeatureGroups(items: IFeatureConfigurationRow[]) {
  items.forEach((item) => {
    if (item.groups.length > 10) {
      const groups = item.groups.slice(0, 10);
      groups.push(localization.ModelAssessment.ModelOverview.other);
      item.groups = groups;
    }
  });
  return items;
}
