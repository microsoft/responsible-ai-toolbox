// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getSpan } from "../../util/getSpan";

import { describeConfigurationPages } from "./configurationPages/describeConfigurationSelection";
import { describeGetStartedPage } from "./configurationPages/describeGetStarted";
import { fairnessDatasets } from "./fairnessDatasets";
import { describeModelComparisonView } from "./modelComparisonView/describeModelComparisonView";
import { describeModelComparisonViewWithError } from "./modelComparisonView/describeModelComparisonViewWithError";
import { describeSingleModelView } from "./singleModelView/describeSingleModelView";
import { describeSingleModelViewWithError } from "./singleModelView/describeSingleModelViewWithError";

export function describeFairness(
  name: keyof typeof fairnessDatasets,
  checkErrorBars = false
): void {
  describe(name, () => {
    beforeEach(() => {
      cy.visit(`#/fairness/${name}/light/english/Version-2`);
    });

    it("should display header", () => {
      getSpan("Fairness dashboard").should("exist");
    });

    if (fairnessDatasets[name].errorMessage) {
      it("should have error message", () => {
        cy.get("#ErrorMessage").should("contain.text", "");
      });
    } else {
      it("should not have error message", () => {
        cy.get("#ErrorMessage").should("not.exist");
      });
    }

    describeGetStartedPage();
    describeConfigurationPages(name);
    if (checkErrorBars) {
      describeModelComparisonViewWithError(fairnessDatasets[name]);
      describeSingleModelViewWithError(fairnessDatasets[name]);
    } else {
      describeModelComparisonView(fairnessDatasets[name]);
      describeSingleModelView(fairnessDatasets[name]);
    }
  });
}
