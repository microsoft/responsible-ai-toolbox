// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const OrangeJuiceForecasting = {
  featureNames: [
    "Advert",
    "Price",
    "Age60",
    "COLLEGE",
    "INCOME",
    "Hincome150",
    "Large HH",
    "Minorities",
    "WorkingWoman",
    "SSTRDIST",
    "SSTRVOL",
    "CPDIST5",
    "CPWVOL5"
  ],
  whatIfForecastingData: {
    hasWhatIfForecastingComponent: true,
    numberOfTimeSeriesOptions: 9,
    testTransformation: {
      featureToSelect: "INCOME",
      operationToSelect: "multiply",
      operationToSelectIndex: 0,
      valueToSelect: 10
    },
    timeSeriesToSelect: "Store = 8, Brand = tropicana"
  }
};
