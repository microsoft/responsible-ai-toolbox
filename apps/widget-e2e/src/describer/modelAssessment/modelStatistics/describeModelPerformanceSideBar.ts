// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BoxChart } from "../../../util/BoxChart";
import { createCohort } from "../../../util/createCohort";
import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function describeModelPerformanceSideBar(
  dataShape: IModelAssessmentData
): void {
  describe("Model performance side bar", () => {
    const props = {
      chart: undefined as unknown as BoxChart,
      dataShape
    };
    beforeEach(() => {
      props.chart = new BoxChart("#ModelPerformanceChart");
    });

    it("Side bar should be updated with updated values", () => {
      cy.get(Locators.MSSideBarCards).should("have.length", 1);
      cy.get(`${Locators.MSCRotatedVerticalBox} button`)
        .click()
        .get(
          `${Locators.DECChoiceFieldGroup} label:contains(${dataShape.modelStatisticsData?.yAxisNewPanelValue})`
        )
        .click();
      cy.get(Locators.MSSideBarNumberOfBinsInput)
        .clear()
        .type(dataShape.modelStatisticsData?.yAxisNumberOfBins || "8");
      cy.get(Locators.SelectButton).click();
      cy.get(`${Locators.MSCRotatedVerticalBox}`).contains(
        dataShape.modelStatisticsData?.yAxisNewValue || "age"
      );
      cy.get(Locators.MSSideBarCards).should(
        "have.length",
        dataShape.modelStatisticsData?.yAxisNumberOfBins || "8"
      );
      // Side bar should be scrollable when data cards overflows
      cy.get(Locators.MSScrollable).should("exist");

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
      cy.get(Locators.MSSideBarCards).should("have.length", 1);
    });

    it("Should have dropdown to select cohort when y axis is changed to different value than cohort", () => {
      createCohort();
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
      // dropdown contains newly created cohort
      cy.get(Locators.MSCohortDropdown).click();
      cy.get(Locators.MSDropdownOptions).should("exist");
      cy.get(Locators.MSCohortDropdown).click();

      //Chart contains newly created cohort
      cy.get(`${Locators.MSCRotatedVerticalBox} button`)
        .click()
        .get(
          `${Locators.DECChoiceFieldGroup} label:contains(${dataShape.modelStatisticsData?.defaultYAxis})`
        )
        .click();
      cy.get(Locators.SelectButton).click();
      cy.get(`${Locators.MSCRotatedVerticalBox}`).contains(
        dataShape.modelStatisticsData?.defaultYAxis || "Cohort"
      );
      cy.get(Locators.MSYAxisPoints)
        .last()
        .should("contain", "CohortCreateE2E");
    });
  });
}
