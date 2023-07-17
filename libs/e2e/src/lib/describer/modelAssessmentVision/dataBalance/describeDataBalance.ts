// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { visit } from "../../../../util/visitVision";
import { Locators } from "../Constants";
import { modelAssessmentVisionDatasets } from "../datasets/modelAssessmentVisionDatasets";
import { IModelAssessmentData } from "../IModelAssessmentData";

import { describeAggregateBalanceMeasures } from "./describeAggregateBalanceMeasures";
import { describeDistributionBalanceMeasures } from "./describeDistributionBalanceMeasures";
import { describeFeatureBalanceMeasures } from "./describeFeatureBalanceMeasures";

const testName = "Vision Data balance";

export function describeVisionDataBalance(
  datasetShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentVisionDatasets
): void {
  describe(testName, () => {
    before(() => {
      visit(name);
      cy.get("#ModelAssessmentDashboard").should("exist");
      cy.get(Locators.DataAnalysisPivot).should("exist");
      cy.get(Locators.DataBalancePivotItem).click();
    });

    const dataBalanceData = datasetShape.dataBalanceData;
    if (
      !dataBalanceData?.aggregateBalanceMeasuresComputed &&
      !dataBalanceData?.distributionBalanceMeasuresComputed &&
      !dataBalanceData?.featureBalanceMeasuresComputed
    ) {
      it("should render no measures computed message", () => {
        cy.get("#MissingParameterPlaceHolder").contains(
          "This tab requires data balance measures to be computed for this dataset. Measures are computed when a 'classification' task type and a list of non-empty categorical features are specified."
        );
      });
      return;
    }
    describeFeatureBalanceMeasures(datasetShape);
    describeDistributionBalanceMeasures(datasetShape);
    describeAggregateBalanceMeasures(datasetShape);
  });
}
