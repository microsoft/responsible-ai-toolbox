import { localization } from "@responsible-ai/localization";
import { GlobalTabKeys } from "../ModelAssessmentEnums";

export function addTabMessage(tab: GlobalTabKeys): string {
  const strings = localization.ModelAssessment.AddingTab.TabAddedMessage;
  switch (tab) {
    case GlobalTabKeys.DataAnalysisTab:
      return strings.DataAnalysis;
    case GlobalTabKeys.CounterfactualsTab:
      return strings.Counterfactuals;
    case GlobalTabKeys.CausalAnalysisTab:
      return strings.CausalAnalysis;
    case GlobalTabKeys.ErrorAnalysisTab:
      return strings.ErrorAnalysis;
    case GlobalTabKeys.FairnessTab:
      return strings.Fairness;
    case GlobalTabKeys.FeatureImportancesTab:
      return strings.FeatureImportances;
    case GlobalTabKeys.ModelOverviewTab:
      return strings.ModelOverview;
    case GlobalTabKeys.VisionTab:
      return strings.Vision;
    default:
      return "";
  }
}
