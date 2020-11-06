// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getSpan } from "../../util/getSpan";

import { fairnessDatasets } from "./fairnessDatasets";

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

    describeSimpleWalkthrough();
  });
}

export function describeSimpleWalkthrough(): void {
  it("should get to model comparison view with default selection", () => {
    describeGetStartedPage();
    describeDefaultSelections();
    describeModelComparisonView();
  });
}

export function describeGetStartedPage(): void {
  it("should move to sensitive feature selection on button click", () => {
    getSpan("Get started").click();
    cy.contains("button", "01 Sensitive features").should(
      "have.class",
      "is-selected"
    );
    cy.contains("button", "02 Performance metrics").should("exist");
    cy.contains("button", "03 Fairness metrics").should("exist");
    getSpan(
      "Along which features would you like to evaluate your model's fairness?"
    ).should("exist");
  });
}

export function describeDefaultSelections(): void {
  it("should move to performance metric selection on button click", () => {
    cy.contains("button", "Next").click();
    cy.contains("button", "01 Sensitive features").should("exist");
    cy.contains("button", "02 Performance metrics").should(
      "have.class",
      "is-selected"
    );
    cy.contains("button", "03 Fairness metrics").should("exist");
    getSpan("How do you want to measure performance?").should("exist");
  });
  it("should move to fairness metric selection on button click", () => {
    cy.contains("button", "Next").click();
    cy.contains("button", "01 Sensitive features").should("exist");
    cy.contains("button", "02 Performance metrics").should("exist");
    cy.contains("button", "03 Fairness metrics").should(
      "have.class",
      "is-selected"
    );
    getSpan("How do you want to measure fairness?").should("exist");
  });
  it("should move to model comparison view on button click", () => {
    cy.contains("button", "Next").click();
    cy.contains("button", "01 Sensitive features").should("exist");
    cy.contains("button", "02 Performance metrics").should("exist");
    cy.contains("button", "03 Fairness metrics").should(
      "have.class",
      "is-selected"
    );
    getSpan("Model comparison").should("exist");
  });
}

export function describeModelComparisonView(): void {
  it("should have all model comparison view elements", () => {
    cy.contains("ms-Dropdown-container", "Sensitive feature 0").should("exist");
    cy.contains("ms-Dropdown-container", "Accuracy").should("exist");
    cy.contains("ms-Dropdown-container", "Accuracy score difference").should(
      "exist"
    );
    getSpan("How to read this chart").should("exist");
    // assert that the plot has 3 points for models
    cy.get("points").find("path").should("have.length", 3);
    getSpan("Key insights").should("exist");
  });
}

export function describeSingleModelView(): void {
  it("should have all single model view elements", () => {
    cy.get("points").find("path").first().click();
    cy.contains("ms-Dropdown-container", "Sensitive feature 0").should("exist");
    cy.contains("ms-Dropdown-container", "Accuracy").should("exist");
    cy.get(
      'ms-Dropdown-container:contains("Accuracy score difference")'
    ).should("exist");
    cy.get('ms-DetailsList:contains("Accuracy score difference")').should(
      "exist"
    );
  });
}
