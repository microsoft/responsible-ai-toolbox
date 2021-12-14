// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BoxChart } from "../../../util/BoxChart";
import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function describeModelPerformanceBoxChart(
  dataShape: IModelAssessmentData
): void {
  describe("Model performance box chart", () => {
    const props = {
      chart: undefined as unknown as BoxChart,
      dataShape
    };
    beforeEach(() => {
      props.chart = new BoxChart("#ModelPerformanceChart");
    });
    it("should render", () => {
      expect(props.chart.Elements.length).greaterThan(0);
    });

    it("should display right y-axis title", () => {
      cy.get(
        `${Locators.MSCRotatedVerticalBox} span[class*="textContainer"]`
      ).contains(dataShape.modelStatisticsData?.defaultYAxis || "Cohort");
    });

    it("should display right x-axis title", () => {
      cy.get(
        `${Locators.MSCHorizontalAxis} span[class*="textContainer"]`
      ).contains(
        dataShape.modelStatisticsData?.defaultXAxis || "Probability : <=50K"
      );
    });

    it("should change to different y-axis title", () => {
      cy.get(`${Locators.MSCRotatedVerticalBox} button`)
        .click()
        .get(
          `${Locators.DECChoiceFieldGroup} label:contains(${dataShape.modelStatisticsData?.yAxisNewPanelValue})`
        )
        .click();
      cy.get(Locators.SelectButton).click();
      cy.get(`${Locators.MSCRotatedVerticalBox}`).contains(
        dataShape.modelStatisticsData?.yAxisNewValue || "age"
      );

      cy.get(`${Locators.MSCRotatedVerticalBox} button`)
        .click()
        .get(
          `${Locators.DECChoiceFieldGroup}  label:contains(${dataShape.modelStatisticsData?.defaultYAxis})`
        )
        .click();
      cy.get(Locators.SelectButton).click();
      cy.get(`${Locators.MSCRotatedVerticalBox}`).contains(
        dataShape.modelStatisticsData?.defaultYAxis || "Cohort"
      );
    });

    it("should change to different x-axis title", () => {
      cy.get(`${Locators.MSCHorizontalAxis} button`).click();
      cy.get(`${Locators.DECChoiceFieldGroup} label:eq(3)`)
        .invoke("text")
        .then((text1) => {
          cy.get(`#AxisConfigPanel label:contains(${text1})`).click();
          cy.get(Locators.SelectButton).click();
          cy.get(`${Locators.MSCHorizontalAxis} button:eq(0)`).contains(text1);
        });
      cy.get(`${Locators.MSCHorizontalAxis} button`)
        .click()
        .get(
          `${Locators.DECChoiceFieldGroup} label:contains(${dataShape.modelStatisticsData?.defaultXAxisPanelValue})`
        )
        .click();
      cy.get(Locators.SelectButton).click();
      cy.get(`${Locators.MSCHorizontalAxis}`).contains(
        dataShape.modelStatisticsData?.defaultXAxis || "Probability : <=50K"
      );
    });
  });
}
