// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getSpan } from "../../util/getSpan";

import { fairnessDatasets } from "./fairnessDatasets";
import { IFairnessData } from './IFairnessData';

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
    cy.contains("button", "01 Sensitive features").should(
      "have.class",
      "is-selected"
    );
    cy.contains("button", "02 Performance metrics");
    cy.contains("button", "03 Fairness metrics");
    getSpan(
      "Along which features would you like to evaluate your model's fairness?"
    ).should("exist");
  });
}

export function describeDefaultSelections(): void {
  it("should move to performance metric selection on button click", () => {
    cy.contains("button", "Next").click();
    cy.contains("button", "01 Sensitive features");
    cy.contains("button", "02 Performance metrics").should(
      "have.class",
      "is-selected"
    );
    cy.contains("button", "03 Fairness metrics");
    getSpan("How do you want to measure performance?").should("exist");
  });
  it("should move to fairness metric selection on button click", () => {
    cy.contains("button", "Next").click();
    cy.contains("button", "01 Sensitive features");
    cy.contains("button", "02 Performance metrics");
    cy.contains("button", "03 Fairness metrics").should(
      "have.class",
      "is-selected"
    );
    getSpan("How do you want to measure fairness?").should("exist");
  });
  it("should move to model comparison view on button click", () => {
    cy.contains("button", "Next").click();
    cy.contains("button", "01 Sensitive features");
    cy.contains("button", "02 Performance metrics");
    cy.contains("button", "03 Fairness metrics").should(
      "have.class",
      "is-selected"
    );
    getSpan("Model comparison").should("exist");
  });
}

export function describeModelComparisonView(data: IFairnessData): void {
  it("should have all model comparison view elements", () => {
    cy.contains(
      "ms-Dropdown-container",
      Object.keys(data.sensitiveFeatures)[0]
    );
    cy.contains("ms-Dropdown-container", data.performanceMetrics[0]).should(
      "exist"
    );
    cy.contains("ms-Dropdown-container", data.fairnessMetrics[0]).should(
      "exist"
    );
    getSpan("How to read this chart").should("exist");
    // assert that the plot has the right number of points for models
    cy.get("points").find("path").should("have.length", data.numberOfModels);
    getSpan("Key insights").should("exist");
  });
}

export function describeSingleModelView(data: IFairnessData): void {
  it("should have all single model view elements", () => {
    const dropdownComponent = "ms-Dropdown-container";
    cy.get("points").find("path").first().click();
    cy.contains(
      dropdownComponent,
      Object.keys(data.sensitiveFeatures)[0]
    );
    cy.contains(dropdownComponent, data.performanceMetrics[0]).should(
      "exist"
    );
    cy.contains(dropdownComponent, data.fairnessMetrics[0]).should(
      "exist"
    );

    // table should contain corresponding metrics
    const tableComponent = "ms-DetailsList";
    cy.contains(tableComponent, data.performanceMetrics[0]);
    cy.contains(tableComponent, data.fairnessMetrics[0]);
    cy.contains(tableComponent, "Overall");
    data.sensitiveFeatures[data.performanceMetrics[0]].forEach(
      (sensitiveFeatureValue: string) => {
        cy.contains(tableComponent, sensitiveFeatureValue);
      }
    );

    // chart dropdown
    cy.contains(dropdownComponent, data.sensitiveFeatures[0]);
    cy.contains(/presentationArea-.*/), Object.keys(data.sensitiveFeatures)[0]);
    data.sensitiveFeatures[data.performanceMetrics[0]].forEach(
      (sensitiveFeatureValue: string) => {
        cy.contains(/presentationArea-.*/).contains(sensitiveFeatureValue);
      }
    );
  };
}
