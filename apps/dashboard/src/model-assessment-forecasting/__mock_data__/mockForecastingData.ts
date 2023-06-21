// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DatasetTaskType,
  FilterMethods,
  IDataset,
  IPreBuiltCohort
} from "@responsible-ai/core-ui";

export const giorgiosPizzeriaBoston: IPreBuiltCohort = {
  cohort_filter_list: [
    {
      arg: ["Giorgio's pizzeria"],
      column: "restaurant",
      method: FilterMethods.Includes
    },
    {
      arg: ["Boston, MA"],
      column: "city",
      method: FilterMethods.Includes
    }
  ],
  name: "restaurant = Giorgio's pizzeria, city = Boston, MA"
};

export const nonnasCannoliBoston: IPreBuiltCohort = {
  cohort_filter_list: [
    {
      arg: ["Nonna's cannoli"],
      column: "restaurant",
      method: FilterMethods.Includes
    },
    {
      arg: ["Boston, MA"],
      column: "city",
      method: FilterMethods.Includes
    }
  ],
  name: "restaurant = Nonna's cannoli, city = Boston, MA"
};

export const bobsSandwichesSandwich: IPreBuiltCohort = {
  cohort_filter_list: [
    {
      arg: ["Bob's sandwiches"],
      column: "restaurant",
      method: FilterMethods.Includes
    },
    {
      arg: ["Sandwich, MA"],
      column: "city",
      method: FilterMethods.Includes
    }
  ],
  name: "restaurant = Bob's sandwiches, city = Sandwich, MA"
};

const categoricalFeatures = [
  "restaurant",
  "city",
  "outdoor seating",
  "tasting menu"
];

// Based on how much money is spent on ads and the daily outside temperature
// predict the number of people dining at a restaurant on any given day.
export const mockForecastingData: IDataset = {
  categorical_features: categoricalFeatures,
  feature_metadata: {
    categorical_features: categoricalFeatures,
    time_series_id_features: ["restaurant", "city"]
  },
  feature_names: [
    "ads",
    "temperature",
    "outdoor seating",
    "tasting menu",
    "restaurant",
    "city"
  ],

  features: [
    [1, 56, "available", "regular", "Giorgio's pizzeria", "Boston, MA"],
    [2, 65, "available", "special", "Giorgio's pizzeria", "Boston, MA"],
    [1.3, 43, "unavailable", "none", "Giorgio's pizzeria", "Boston, MA"],
    [2.1, 55, "unavailable", "regular", "Giorgio's pizzeria", "Boston, MA"],
    [1.6, 70, "available", "regular", "Giorgio's pizzeria", "Boston, MA"],
    [1.9, 67, "unavailable", "none", "Giorgio's pizzeria", "Boston, MA"],
    [1.3, 84, "unavailable", "regular", "Giorgio's pizzeria", "Boston, MA"],
    [2.4, 76, "unavailable", "special", "Giorgio's pizzeria", "Boston, MA"],
    [1.9, 73, "available", "regular", "Giorgio's pizzeria", "Boston, MA"],
    [2.9, 61, "unavailable", "regular", "Giorgio's pizzeria", "Boston, MA"],
    [0.2, 56, "available", "regular", "Nonna's cannoli", "Boston, MA"],
    [0.1, 65, "unavailable", "regular", "Nonna's cannoli", "Boston, MA"],
    [0.4, 43, "unavailable", "regular", "Nonna's cannoli", "Boston, MA"],
    [0.3, 55, "unavailable", "none", "Nonna's cannoli", "Boston, MA"],
    [0.2, 70, "unavailable", "special", "Nonna's cannoli", "Boston, MA"],
    [0.1, 67, "available", "regular", "Nonna's cannoli", "Boston, MA"],
    [0.3, 84, "unavailable", "regular", "Nonna's cannoli", "Boston, MA"],
    [0.4, 76, "unavailable", "special", "Nonna's cannoli", "Boston, MA"],
    [0.3, 73, "unavailable", "none", "Nonna's cannoli", "Boston, MA"],
    [0.5, 61, "available", "regular", "Nonna's cannoli", "Boston, MA"],
    [3, 27, "available", "regular", "Bob's sandwiches", "Sandwich, MA"],
    [2.5, 31, "unavailable", "regular", "Bob's sandwiches", "Sandwich, MA"],
    [2.7, 33, "unavailable", "regular", "Bob's sandwiches", "Sandwich, MA"],
    [3.9, 47, "available", "regular", "Bob's sandwiches", "Sandwich, MA"],
    [3.4, 91, "available", "special", "Bob's sandwiches", "Sandwich, MA"],
    [3.1, 87, "available", "none", "Bob's sandwiches", "Sandwich, MA"],
    [1.9, 81, "available", "none", "Bob's sandwiches", "Sandwich, MA"],
    [1.8, 34, "unavailable", "regular", "Bob's sandwiches", "Sandwich, MA"],
    [3.4, 53, "unavailable", "special", "Bob's sandwiches", "Sandwich, MA"],
    [3, 62, "available", "regular", "Bob's sandwiches", "Sandwich, MA"]
  ],
  index: [
    "10-10-2022",
    "10-11-2022",
    "10-12-2022",
    "10-13-2022",
    "10-14-2022",
    "10-15-2022",
    "10-16-2022",
    "10-17-2022",
    "10-18-2022",
    "10-19-2022",
    "10-10-2022",
    "10-11-2022",
    "10-12-2022",
    "10-13-2022",
    "10-14-2022",
    "10-15-2022",
    "10-16-2022",
    "10-17-2022",
    "10-18-2022",
    "10-19-2022",
    "10-10-2022",
    "10-11-2022",
    "10-12-2022",
    "10-13-2022",
    "10-14-2022",
    "10-15-2022",
    "10-16-2022",
    "10-17-2022",
    "10-18-2022",
    "10-19-2022"
  ],
  predicted_y: [
    213, 349, 320, 303, 511, 501, 762, 631, 599, 398, 243, 549, 390, 301, 311,
    701, 722, 681, 299, 498, 763, 149, 120, 103, 111, 101, 162, 131, 299, 198
  ],
  task_type: DatasetTaskType.Forecasting,
  true_y: [
    240, 310, 342, 392, 514, 501, 795, 621, 600, 422, 222, 500, 345, 678, 343,
    454, 667, 399, 588, 440, 120, 99, 101, 110, 150, 130, 125, 127, 200, 187
  ]
};
