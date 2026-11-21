// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { describeWhatIfForecasting } from "@responsible-ai/e2e";

describe("Standards-mode forecasting", () => {
  before(() => {
    cy.visit("/#/modelAssessmentForecasting/restaurants/1-light/en/1");
    cy.document().its("compatMode").should("equal", "CSS1Compat");
  });
  describeWhatIfForecasting({
    featureNames: [
      "ads",
      "temperature",
      "outdoor seating",
      "tasting menu",
      "restaurant",
      "city"
    ],
    whatIfForecastingData: {
      hasWhatIfForecastingComponent: true,
      numberOfTimeSeriesOptions: 3,
      testTransformation: {
        featureToSelect: "temperature",
        operationToSelect: "multiply",
        operationToSelectIndex: 0,
        valueToSelect: 10
      },
      timeSeriesToSelect: "restaurant = Bob's sandwiches, city = Sandwich, MA"
    }
  });
});
