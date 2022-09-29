// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

import { GlobalTabKeys } from "../ModelAssessmentEnums";

import { addTabMessage } from "./addTabMessage";

describe("addTabMessage", () => {
  const strings = localization.ModelAssessment.AddingTab.TabAddedMessage;
  const unknown = "UnknownTab" as GlobalTabKeys;
  it("should add correct message when adding a new component", () => {
    expect(addTabMessage(GlobalTabKeys.DataAnalysisTab)).toEqual(
      strings.DataAnalysis
    );
    expect(addTabMessage(GlobalTabKeys.CounterfactualsTab)).toEqual(
      strings.Counterfactuals
    );
    expect(addTabMessage(GlobalTabKeys.CausalAnalysisTab)).toEqual(
      strings.CausalAnalysis
    );
    expect(addTabMessage(GlobalTabKeys.ErrorAnalysisTab)).toEqual(
      strings.ErrorAnalysis
    );
    expect(addTabMessage(GlobalTabKeys.FairnessTab)).toEqual(strings.Fairness);
    expect(addTabMessage(GlobalTabKeys.FeatureImportancesTab)).toEqual(
      strings.FeatureImportances
    );
    expect(addTabMessage(GlobalTabKeys.ModelOverviewTab)).toEqual(
      strings.ModelOverview
    );
    expect(addTabMessage(GlobalTabKeys.VisionTab)).toEqual(strings.Vision);
    expect(function () {
      addTabMessage(unknown);
    }).toThrow(new Error(`Unexpected component ${unknown}.`));
  });
});
