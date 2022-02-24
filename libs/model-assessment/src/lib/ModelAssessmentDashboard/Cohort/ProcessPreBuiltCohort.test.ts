// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  JointDataset,
  FilterMethods,
  IPreBuiltCohort
} from "@responsible-ai/core-ui";
import { ModelMetadata } from "@responsible-ai/mlchartlib";

import {
  IMultiClassLocalFeatureImportance,
  ISingleClassLocalFeatureImportance,
  IExplanationModelMetadata
} from "../Interfaces/ExplanationInterfaces";
import { IModelAssessmentDashboardProps } from "../ModelAssessmentDashboardProps";

import { processPreBuiltCohort } from "./ProcessPreBuiltCohort";

export const adultCohortDataContinuous: IPreBuiltCohort = {
  cohort_filter_list: [
    {
      arg: [65],
      column: "age",
      method: FilterMethods.LessThan
    },
    {
      arg: [40],
      column: "hours-per-week",
      method: FilterMethods.GreaterThan
    }
  ],
  name: "Cohort Continuous"
};

export const adultCohortDataCategorical: IPreBuiltCohort = {
  cohort_filter_list: [
    {
      arg: ["HS-grad", "Bachelors"],
      column: "education",
      method: FilterMethods.Includes
    }
  ],
  name: "Cohort Categorical"
};

export const adultCohortDataIndex: IPreBuiltCohort = {
  cohort_filter_list: [
    {
      arg: [23],
      column: "Index",
      method: FilterMethods.LessThan
    }
  ],
  name: "Cohort Index"
};

export const adultCohortDataPredictedY: IPreBuiltCohort = {
  cohort_filter_list: [
    {
      arg: ["<=50K", ">50K"],
      column: "Predicted Y",
      method: FilterMethods.Includes
    }
  ],
  name: "Cohort Predicted Y"
};

export const adultCohortDataTrueY: IPreBuiltCohort = {
  cohort_filter_list: [
    {
      arg: ["<=50K", ">50K"],
      column: "True Y",
      method: FilterMethods.Includes
    }
  ],
  name: "Cohort True Y"
};

export const adultCohortDataClassificationOutcome: IPreBuiltCohort = {
  cohort_filter_list: [
    {
      arg: [
        "True positive",
        "True negative",
        "False negative",
        "False positive"
      ],
      column: "Classification outcome",
      method: FilterMethods.Includes
    }
  ],
  name: "Cohort Classification outcome"
};

function getJointDatasetClassification(): JointDataset {
  const features = [
    [
      50,
      "Private",
      39590,
      "HS-grad",
      9,
      "Married-civ-spouse",
      "Farming-fishing",
      "Husband",
      "White",
      "Male",
      0,
      0,
      48,
      "United-States"
    ],
    [
      24,
      "Local-gov",
      174413,
      "Bachelors",
      13,
      "Never-married",
      "Prof-specialty",
      "Not-in-family",
      "White",
      "Female",
      0,
      1974,
      40,
      "United-States"
    ]
  ];
  const probabilityY = [
    [0.7510962272030672, 0.24890377279693277],
    [0.7802282829948453, 0.21977171700515474]
  ];
  const predictedY = [1, 0];
  const trueY = [1, 0];
  const localExplanations:
    | IMultiClassLocalFeatureImportance
    | ISingleClassLocalFeatureImportance
    | undefined = undefined;
  const featureIsCategorical = [
    false,
    true,
    false,
    true,
    false,
    true,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    true
  ];
  const featureRanges = ModelMetadata.buildFeatureRanges(
    features,
    featureIsCategorical
  );
  const modelMetadata = {
    classNames: ["<=50K", ">50K"],
    featureIsCategorical,
    featureNames: [
      "age",
      "workclass",
      "fnlwgt",
      "education",
      "education-num",
      "marital-status",
      "occupation",
      "relationship",
      "race",
      "gender",
      "capital-gain",
      "capital-loss",
      "hours-per-week",
      "native-country"
    ],
    featureNamesAbridged: [
      "age",
      "workclass",
      "fnlwgt",
      "education",
      "education-num",
      "marital-status",
      "occupation",
      "relationship",
      "race",
      "gender",
      "capital-gain",
      "capital-loss",
      "hours-per-week",
      "native-country"
    ],
    featureRanges,
    modelType: "binary"
  } as IExplanationModelMetadata;

  const jointDataset = new JointDataset({
    dataset: features,
    localExplanations,
    metadata: modelMetadata,
    predictedProbabilities: probabilityY,
    predictedY,
    trueY
  });
  return jointDataset;
}

describe("Translate user defined cohorts for classification", () => {
  const mockJointDataset = getJointDatasetClassification();
  it("should be able to translate index cohort", () => {
    const mockProp: IModelAssessmentDashboardProps = {
      cohortData: [adultCohortDataIndex]
    } as IModelAssessmentDashboardProps;
    const errorCohortList = processPreBuiltCohort(mockProp, mockJointDataset);
    expect(errorCohortList.length).toBe(1);
    expect(errorCohortList[0].cohort.name).toBe(adultCohortDataIndex.name);
    expect(errorCohortList[0].cohort.filters.length).toBe(
      adultCohortDataIndex.cohort_filter_list.length
    );
    expect(errorCohortList[0].cohort.filters[0].column).toBe(
      adultCohortDataIndex.cohort_filter_list[0].column
    );
    expect(errorCohortList[0].cohort.filters[0].method).toBe(
      adultCohortDataIndex.cohort_filter_list[0].method
    );
    expect(errorCohortList[0].cohort.filters[0].arg).toEqual(
      adultCohortDataIndex.cohort_filter_list[0].arg
    );
  });
  it("should be able to translate dataset continuous cohort", () => {
    const mockProp: IModelAssessmentDashboardProps = {
      cohortData: [adultCohortDataContinuous]
    } as IModelAssessmentDashboardProps;
    const errorCohortList = processPreBuiltCohort(mockProp, mockJointDataset);
    expect(errorCohortList.length).toBe(1);
    expect(errorCohortList[0].cohort.name).toBe(adultCohortDataContinuous.name);
  });
  it("should be able to translate dataset categorical cohort", () => {
    const mockProp: IModelAssessmentDashboardProps = {
      cohortData: [adultCohortDataCategorical]
    } as IModelAssessmentDashboardProps;
    const errorCohortList = processPreBuiltCohort(mockProp, mockJointDataset);
    expect(errorCohortList.length).toBe(1);
  });
  it("should be able to translate classification outcome cohort", () => {
    const mockProp: IModelAssessmentDashboardProps = {
      cohortData: [adultCohortDataClassificationOutcome]
    } as IModelAssessmentDashboardProps;
    const errorCohortList = processPreBuiltCohort(mockProp, mockJointDataset);
    expect(errorCohortList.length).toBe(1);
    expect(errorCohortList[0].cohort.name).toBe(
      adultCohortDataClassificationOutcome.name
    );
    expect(errorCohortList[0].cohort.filters.length).toBe(
      adultCohortDataClassificationOutcome.cohort_filter_list.length
    );
    expect(errorCohortList[0].cohort.filters[0].column).toBe(
      JointDataset.ClassificationError
    );
    expect(errorCohortList[0].cohort.filters[0].method).toBe(
      adultCohortDataClassificationOutcome.cohort_filter_list[0].method
    );
    console.log(errorCohortList[0].cohort.filters[0].arg);
    expect(errorCohortList[0].cohort.filters[0].arg).toEqual([0, 1, 2, 3]);
  });
  it("should be able to translate predicted y cohort", () => {
    const mockProp: IModelAssessmentDashboardProps = {
      cohortData: [adultCohortDataPredictedY]
    } as IModelAssessmentDashboardProps;
    const errorCohortList = processPreBuiltCohort(mockProp, mockJointDataset);
    expect(errorCohortList.length).toBe(1);
    expect(errorCohortList[0].cohort.name).toBe(adultCohortDataPredictedY.name);
    expect(errorCohortList[0].cohort.filters.length).toBe(
      adultCohortDataPredictedY.cohort_filter_list.length
    );
    expect(errorCohortList[0].cohort.filters[0].column).toBe(
      JointDataset.PredictedYLabel
    );
    expect(errorCohortList[0].cohort.filters[0].method).toBe(
      adultCohortDataPredictedY.cohort_filter_list[0].method
    );
    console.log(errorCohortList[0].cohort.filters[0].arg);
    expect(errorCohortList[0].cohort.filters[0].arg).toEqual([0, 1]);
  });
  it("should be able to translate true y cohort", () => {
    const mockProp: IModelAssessmentDashboardProps = {
      cohortData: [adultCohortDataTrueY]
    } as IModelAssessmentDashboardProps;
    const errorCohortList = processPreBuiltCohort(mockProp, mockJointDataset);
    expect(errorCohortList.length).toBe(1);
    expect(errorCohortList[0].cohort.name).toBe(adultCohortDataTrueY.name);
    expect(errorCohortList[0].cohort.filters.length).toBe(
      adultCohortDataTrueY.cohort_filter_list.length
    );
    expect(errorCohortList[0].cohort.filters[0].column).toBe(
      JointDataset.TrueYLabel
    );
    expect(errorCohortList[0].cohort.filters[0].method).toBe(
      adultCohortDataTrueY.cohort_filter_list[0].method
    );
    console.log(errorCohortList[0].cohort.filters[0].arg);
    expect(errorCohortList[0].cohort.filters[0].arg).toEqual([0, 1]);
  });
});
