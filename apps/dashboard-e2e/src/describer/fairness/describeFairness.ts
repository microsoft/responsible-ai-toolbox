// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getSpan } from "../../util/getSpan";

import { fairnessDatasets } from "./fairnessDatasets";
import { IFairnessData } from "./IFairnessData";

const dropdownComponent = "ms-Dropdown-container";
const tableComponent = "ms-DetailsList";

export function describeFairness(name: keyof typeof fairnessDatasets): void {
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

    describeSimpleWalkthrough(fairnessDatasets[name]);
  });
}

export function describeSimpleWalkthrough(data: IFairnessData): void {
  it("should get to model comparison view with default selection", () => {
    describeGetStartedPage();
    describeDefaultSelections();
    describeModelComparisonView(data);
  });
}

export function describeGetStartedPage(): void {
  it("should move to sensitive feature selection on button click", () => {
    getSpan("Get started").click();
    cy.get('button:contains("01 Sensitive features")').should(
      "have.class",
      "is-selected"
    );
    cy.get('button:contains("02 Performance metrics")').should("exist");
    cy.get('button:contains("03 Fairness metrics")').should("exist");
    getSpan(
      "Along which features would you like to evaluate your model's fairness?"
    ).should("exist");
  });
}

export function describeDefaultSelections(): void {
  it("should move to performance metric selection on button click", () => {
    cy.get('button:contains("Next")').click();
    cy.get('button:contains("01 Sensitive features")').should("exist");
    cy.get('button:contains("02 Performance metrics")').should(
      "have.class",
      "is-selected"
    );
    cy.get('button:contains("03 Fairness metrics")').should("exist");
    getSpan("How do you want to measure performance?").should("exist");
  });
  cy.wait(10000);
  it("should move to fairness metric selection on button click", () => {
    cy.get('button:contains("Next")').click();
    cy.get('button:contains("01 Sensitive features")').should("exist");
    cy.get('button:contains("02 Performance metrics")').should("exist");
    cy.get('button:contains("03 Fairness metrics")').should(
      "have.class",
      "is-selected"
    );
    getSpan("How do you want to measure fairness?").should("exist");
  });
  cy.wait(10000);
  it("should move to model comparison view on button click", () => {
    cy.get('button:contains("Next")').click();
    cy.get('button:contains("01 Sensitive features")').should("exist");
    cy.get('button:contains("02 Performance metrics")').should("exist");
    cy.get('button:contains("03 Fairness metrics")').should(
      "have.class",
      "is-selected"
    );
    getSpan("Model comparison").should("exist");
  });
  cy.wait(10000);
}

export function describeModelComparisonView(data: IFairnessData): void {
  it("should have all model comparison view elements", () => {
    cy.get(
      `${dropdownComponent}:contains("${
        Object.keys(data.sensitiveFeatures)[0]
      }")`
    ).should("exist");
    cy.get(
      `${dropdownComponent}:contains("${data.performanceMetrics[0]}")`
    ).should("exist");
    cy.get(
      `${dropdownComponent}:contains("${data.fairnessMetrics[0]}")`
    ).should("exist");
    getSpan("How to read this chart").should("exist");
    // assert that the plot has the right number of points for models
    cy.get("points").find("path").should("have.length", data.numberOfModels);
    getSpan("Key insights").should("exist");
  });
}

export function describeSingleModelView(data: IFairnessData): void {
  it("should have all single model view elements", () => {
    cy.get("points").find("path").first().click();
    cy.get(
      `${dropdownComponent}:contains("${
        Object.keys(data.sensitiveFeatures)[0]
      }")`
    ).should("exist");
    cy.get(
      `${dropdownComponent}:contains("${data.performanceMetrics[0]}")`
    ).should("exist");
    cy.get(
      `${dropdownComponent}:contains("${data.fairnessMetrics[0]}")`
    ).should("exist");

    // table should contain corresponding metrics
    cy.get(`${tableComponent}:contains("${data.performanceMetrics[0]}")`).should("exist");
    cy.get(`${tableComponent}:contains("${data.fairnessMetrics[0]}")`).should("exist");
    cy.get(tableComponent).should("contain.text", "Overall");
    data.sensitiveFeatures[data.performanceMetrics[0]].forEach(
      (sensitiveFeatureValue: string) => {
        cy.get(tableComponent).should("contain.text", sensitiveFeatureValue);
      }
    );

    // chart dropdown
    cy.contains(
      dropdownComponent,
      Object.keys(data.sensitiveFeatures)[0]
    ).should("exist");
    cy.contains(/presentationArea-.*/)
      .contains(Object.keys(data.sensitiveFeatures)[0])
      .should("exist");
    data.sensitiveFeatures[data.performanceMetrics[0]].forEach(
      (sensitiveFeatureValue: string) => {
        cy.contains(/presentationArea-.*/)
          .contains(sensitiveFeatureValue)
          .should("exist");
      }
    );
  });
}
