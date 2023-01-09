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

// Based on how much money is spent on ads and the daily outside temperature
// predict the number of people dining at a restaurant on any given day.
export const mockForecastingData: IDataset = {
  categorical_features: ["restaurant", "city"],
  feature_metadata: {
    categorical_features: ["restaurant", "city"],
    time_series_id_column_names: ["restaurant", "city"]
  },
  feature_names: ["ads", "temperature", "restaurant", "city"],

  features: [
    [1, 56, "Giorgio's pizzeria", "Boston, MA"],
    [2, 65, "Giorgio's pizzeria", "Boston, MA"],
    [1.3, 43, "Giorgio's pizzeria", "Boston, MA"],
    [2.1, 55, "Giorgio's pizzeria", "Boston, MA"],
    [1.6, 70, "Giorgio's pizzeria", "Boston, MA"],
    [1.9, 67, "Giorgio's pizzeria", "Boston, MA"],
    [1.3, 84, "Giorgio's pizzeria", "Boston, MA"],
    [2.4, 76, "Giorgio's pizzeria", "Boston, MA"],
    [1.9, 73, "Giorgio's pizzeria", "Boston, MA"],
    [2.9, 61, "Giorgio's pizzeria", "Boston, MA"],
    [0.2, 56, "Nonna's cannoli", "Boston, MA"],
    [0.1, 65, "Nonna's cannoli", "Boston, MA"],
    [0.4, 43, "Nonna's cannoli", "Boston, MA"],
    [0.3, 55, "Nonna's cannoli", "Boston, MA"],
    [0.2, 70, "Nonna's cannoli", "Boston, MA"],
    [0.1, 67, "Nonna's cannoli", "Boston, MA"],
    [0.3, 84, "Nonna's cannoli", "Boston, MA"],
    [0.4, 76, "Nonna's cannoli", "Boston, MA"],
    [0.3, 73, "Nonna's cannoli", "Boston, MA"],
    [0.5, 61, "Nonna's cannoli", "Boston, MA"],
    [3, 27, "Bob's sandwiches", "Sandwich, MA"],
    [2.5, 31, "Bob's sandwiches", "Sandwich, MA"],
    [2.7, 33, "Bob's sandwiches", "Sandwich, MA"],
    [3.9, 47, "Bob's sandwiches", "Sandwich, MA"],
    [3.4, 91, "Bob's sandwiches", "Sandwich, MA"],
    [3.1, 87, "Bob's sandwiches", "Sandwich, MA"],
    [1.9, 81, "Bob's sandwiches", "Sandwich, MA"],
    [1.8, 34, "Bob's sandwiches", "Sandwich, MA"],
    [3.4, 53, "Bob's sandwiches", "Sandwich, MA"],
    [3, 62, "Bob's sandwiches", "Sandwich, MA"]
  ],
  index: [
    "2010-10-10",
    "2010-10-11",
    "2010-10-12",
    "2010-10-13",
    "2010-10-14",
    "2010-10-15",
    "2010-10-16",
    "2010-10-17",
    "2010-10-18",
    "2010-10-19",
    "2010-10-10",
    "2010-10-11",
    "2010-10-12",
    "2010-10-13",
    "2010-10-14",
    "2010-10-15",
    "2010-10-16",
    "2010-10-17",
    "2010-10-18",
    "2010-10-19",
    "2010-10-10",
    "2010-10-11",
    "2010-10-12",
    "2010-10-13",
    "2010-10-14",
    "2010-10-15",
    "2010-10-16",
    "2010-10-17",
    "2010-10-18",
    "2010-10-19",
    "2010-10-10",
    "2010-10-11",
    "2010-10-12",
    "2010-10-13",
    "2010-10-14",
    "2010-10-15",
    "2010-10-16",
    "2010-10-17",
    "2010-10-18",
    "2010-10-19"
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
