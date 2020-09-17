// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../support/getMenu";
import { IDataSetShape } from "../IDataSetShape";
import { describeGlobalExplanationBarChart } from "./describeGlobalExplanationBarChart";
import { describeGlobalExplanationBoxChart } from "./describeGlobalExplanationBoxChart";

const testName = "Aggregate Feature Importance";

export class AggregateFeatureImportanceDescriber {
  public constructor(
    private datasetName: string,
    private datasetShape: IDataSetShape
  ) {
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
      describeGlobalExplanationBarChart(this.datasetShape);
      describeGlobalExplanationBoxChart(this.datasetShape);
    });
  }
  private beforeEach(): void {
    beforeEach(() => {
      cy.visit(`#/interpret/${this.datasetName}/light/english/Version-2`);
    });
  }
}
