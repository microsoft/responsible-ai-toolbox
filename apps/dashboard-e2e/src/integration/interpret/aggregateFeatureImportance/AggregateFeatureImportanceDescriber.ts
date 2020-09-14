// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../support/getMenu";
import { describeGlobalExplanationChart } from "./describeGlobalExplanationChart";

const testName = "Aggregate Feature Importance";

export class AggregateFeatureImportanceDescriber {
  public constructor(public dataset: string) {
    return;
  }
  public describeTabHeader(): void {
    describe(testName, () => {
      this.beforeEach();
      it("Tab Header should exist", () => {
        getMenu("Aggregate Feature Importance", "#DashboardPivot").should(
          "exist"
        );
      });
    });
  }
  public describeGlobalExplanationChart(): void {
    describe(testName, () => {
      this.beforeEach();
      describeGlobalExplanationChart();
    });
  }
  private beforeEach(): void {
    beforeEach(() => {
      cy.visit(`#/interpret/${this.dataset}/light/english/Version-2`);
    });
  }
}
