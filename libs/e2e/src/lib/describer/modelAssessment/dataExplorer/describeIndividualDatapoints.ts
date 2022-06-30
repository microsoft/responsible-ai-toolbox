// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ScatterHighchart } from "../../../../util/ScatterHighchart";
import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

import { describeAxisConfigDialog } from "./describeAxisConfigDialog";

export function describeIndividualDatapoints(
  dataShape: IModelAssessmentData
): void {
  describe("Individual datapoints chart", () => {
    const props = {
      chart: undefined as unknown as ScatterHighchart,
      dataShape
    };
    beforeEach(() => {
      cy.get(
        '#ChartTypeSelection label:contains("Individual datapoints")'
      ).click();
      props.chart = new ScatterHighchart("#DatasetExplorerChart");
    });

    if (dataShape.isRegression) {
      it("Should have clickable individual datapoints that are positive for regression error", () => {
        cy.get(Locators.DEIndividualDatapoints).click();
        cy.get(`${Locators.DECohortDropdown} span`).should(
          "contain",
          dataShape.cohortDefaultName
        );
        axisSelection("Error");

        cy.get(Locators.DEPoints).each((point) => {
          cy.wrap(point).trigger("mouseover", { force: true });
          cy.get(Locators.TooltipContainer).then((tooltip) => {
            cy.wrap(tooltip).should("contain", "Regression error");
            cy.wrap(tooltip).should("not.have.value", "Regression error: -");
          });
        });
        axisSelection("Index");
        cy.get(Locators.DEAggregatePlots).click();
      });
    }

    describe.skip("Dataset explorer Chart", () => {
      it("should have color label", () => {
        cy.get('#DatasetExplorerChart label:contains("Color value")').should(
          "exist"
        );
      });
      it("should render", () => {
        expect(props.chart.Elements.length).greaterThan(0);
      });
      it("Should render datapoint info on hover", () => {
        props.chart.clickNthPoint(15);
        cy.get("#DatasetExplorerChart").should(
          "contain",
          `${props.dataShape.datasetExplorerData?.defaultXAxis}:`
        );
        props.chart.clickNthPoint(15);
      });
    });
    if (
      props.dataShape.datasetExplorerData?.defaultXAxis &&
      props.dataShape.datasetExplorerData?.defaultYAxis
    ) {
      describeAxisConfigDialog(
        props.dataShape.datasetExplorerData?.defaultXAxis,
        props.dataShape.datasetExplorerData?.defaultYAxis,
        !!props.dataShape.datasetExplorerData?.noY,
        true,
        props.dataShape.featureNames
      );
    }
  });
}

export function axisSelection(label: string): void {
  cy.get(Locators.DECHorizontalAxisButton)
    .click()
    .get(
      `#AxisConfigPanel div[class*='ms-ChoiceFieldGroup'] label:contains('${label}')`
    )
    .click()
    .get("#AxisConfigPanel")
    .find("button")
    .contains("Apply")
    .click();
}
