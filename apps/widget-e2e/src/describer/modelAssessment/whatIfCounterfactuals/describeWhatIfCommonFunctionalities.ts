// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

import { getSpan } from "../../../util/getSpan";
import { ScatterChart } from "../../../util/ScatterChart";
import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

import { describeSubBarChart } from "./describeSubBarChart";

export function describeWhatIfCommonFunctionalities(
  dataShape: IModelAssessmentData
): void {
  describe("What if common functionalities", () => {
    const props = {
      chart: undefined as unknown as ScatterChart,
      dataShape
    };
    beforeEach(() => {
      props.chart = new ScatterChart("#IndividualFeatureImportanceChart");
    });
    it("should render right number of points", () => {
      expect(props.chart.Elements.length).equals(
        dataShape.featureImportanceData?.datapoint
      );
    });

    describe("Scatter chart clickable", () => {
      it("should select none by default", () => {
        cy.get(
          "#IndividualFeatureContainer div[class^='legendAndText'] input[role='combobox']"
        ).should("have.attr", "value", "");
      });
      it("should show message on sub chart", () => {
        const message =
          !dataShape.featureImportanceData?.noLocalImportance &&
          !dataShape.featureImportanceData?.noFeatureImportance
            ? localization.Counterfactuals.localImportanceSelectData
            : "Provide local feature importances to see how each feature impacts individual predictions.";
        cy.get("#MissingParameterPlaceHolder").should("contain.text", message);
      });
      it("should select the first point and update bar chart", () => {
        props.chart.clickNthPoint(10);
        cy.get(
          "#IndividualFeatureContainer div[class^='legendAndText'] input[role='combobox']"
        )
          .should("have.attr", "value")
          .and("contain", "Index");
        cy.get("#MissingParameterPlaceHolder").should("not.exist");
        props.chart.clickNthPoint(10);
      });

      it("should update when combo box change", () => {
        cy.get(Locators.WICDatapointDropbox).click();
        getSpan("Index 5").click();
        cy.get(Locators.WICLocalImportanceDescription).contains("Row 5");
      });
    });

    if (
      !dataShape.featureImportanceData?.noLocalImportance &&
      !dataShape.featureImportanceData?.noFeatureImportance
    ) {
      describeSubBarChart(dataShape);
    }
  });
}
