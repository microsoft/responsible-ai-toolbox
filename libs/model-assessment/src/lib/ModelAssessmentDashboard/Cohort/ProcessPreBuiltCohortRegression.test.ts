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

const bostonCohortDataContinuous: IPreBuiltCohort = {
  cohort_filter_list: [
    {
      arg: [30.5],
      column: "AGE",
      method: FilterMethods.LessThan
    },
    {
      arg: [5.5],
      column: "CRIM",
      method: FilterMethods.GreaterThan
    }
  ],
  name: "Cohort Continuous"
};

const bostonCohortDataCategorical: IPreBuiltCohort = {
  cohort_filter_list: [
    {
      arg: [0, 1],
      column: "CHAS",
      method: FilterMethods.Includes
    }
  ],
  name: "Cohort Categorical"
};

const bostonCohortDataIndex: IPreBuiltCohort = {
  cohort_filter_list: [
    {
      arg: [23],
      column: "Index",
      method: FilterMethods.LessThan
    }
  ],
  name: "Cohort Index"
};

const bostonCohortDataPredictedY: IPreBuiltCohort = {
  cohort_filter_list: [
    {
      arg: [30, 45],
      column: "Predicted Y",
      method: FilterMethods.InTheRangeOf
    }
  ],
  name: "Cohort Predicted Y"
};

const bostonCohortDataTrueY: IPreBuiltCohort = {
  cohort_filter_list: [
    {
      arg: [45.8],
      column: "True Y",
      method: FilterMethods.LessThan
    }
  ],
  name: "Cohort True Y"
};

const bostonCohortDataRegressionError: IPreBuiltCohort = {
  cohort_filter_list: [
    {
      arg: [20.5],
      column: "Error",
      method: FilterMethods.GreaterThan
    }
  ],
  name: "Cohort Regression Error"
};

function getJointDatasetRegression(): JointDataset {
  const features = [
    [
      0.06724, 0, 3.24, 0, 0.46, 6.333, 17.2, 5.2146, 4, 430, 16.9, 375.21, 7.34
    ],
    [9.2323, 0, 18.1, 1, 0.631, 6.216, 100, 1.1691, 24, 666, 20.2, 366.15, 9.53]
  ];
  const predictedY = [24.91644033, 25.08208277];
  const trueY = [22.6, 50];
  const localExplanations:
    | IMultiClassLocalFeatureImportance
    | ISingleClassLocalFeatureImportance
    | undefined = undefined;
  const featureIsCategorical = [
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false
  ];
  const featureRanges = ModelMetadata.buildFeatureRanges(
    features,
    featureIsCategorical
  );
  const modelMetadata = {
    classNames: ["Class 0"],
    featureIsCategorical,
    featureNames: [
      "CRIM",
      "ZN",
      "INDUS",
      "CHAS",
      "NOX",
      "RM",
      "AGE",
      "DIS",
      "RAD",
      "TAX",
      "PTRATIO",
      "B",
      "LSTAT"
    ],
    featureNamesAbridged: [
      "CRIM",
      "ZN",
      "INDUS",
      "CHAS",
      "NOX",
      "RM",
      "AGE",
      "DIS",
      "RAD",
      "TAX",
      "PTRATIO",
      "B",
      "LSTAT"
    ],
    featureRanges,
    modelType: "regression"
  } as IExplanationModelMetadata;

  const jointDataset = new JointDataset({
    dataset: features,
    localExplanations,
    metadata: modelMetadata,
    predictedY,
    trueY
  });
  return jointDataset;
}

describe("Translate user defined cohorts for regression", () => {
  const mockJointDataset = getJointDatasetRegression();
  it("should be able to translate index cohort", () => {
    const mockProp: IModelAssessmentDashboardProps = {
      cohortData: [bostonCohortDataIndex]
    } as IModelAssessmentDashboardProps;
    const [errorCohortList, errorStrings] = processPreBuiltCohort(
      mockProp,
      mockJointDataset
    );
    expect(errorStrings.length).toBe(0);
    expect(errorCohortList.length).toBe(1);
    expect(errorCohortList[0].cohort.name).toBe(bostonCohortDataIndex.name);
    expect(errorCohortList[0].cohort.filters.length).toBe(
      bostonCohortDataIndex.cohort_filter_list.length
    );
    expect(errorCohortList[0].cohort.filters[0].column).toBe(
      bostonCohortDataIndex.cohort_filter_list[0].column
    );
    expect(errorCohortList[0].cohort.filters[0].method).toBe(
      bostonCohortDataIndex.cohort_filter_list[0].method
    );
    expect(errorCohortList[0].cohort.filters[0].arg).toEqual(
      bostonCohortDataIndex.cohort_filter_list[0].arg
    );
  });
  it("should be able to translate dataset continuous cohort", () => {
    const mockProp: IModelAssessmentDashboardProps = {
      cohortData: [bostonCohortDataContinuous]
    } as IModelAssessmentDashboardProps;
    const [errorCohortList, errorStrings] = processPreBuiltCohort(
      mockProp,
      mockJointDataset
    );
    expect(errorStrings.length).toBe(0);
    expect(errorCohortList.length).toBe(1);
    expect(errorCohortList[0].cohort.name).toBe(
      bostonCohortDataContinuous.name
    );
    expect(errorCohortList[0].cohort.filters.length).toBe(
      bostonCohortDataContinuous.cohort_filter_list.length
    );
    for (
      let index = 0;
      index < errorCohortList[0].cohort.filters.length;
      index++
    ) {
      expect(errorCohortList[0].cohort.filters[index].column).toContain(
        JointDataset.DataLabelRoot
      );
      expect(errorCohortList[0].cohort.filters[index].method).toBe(
        bostonCohortDataContinuous.cohort_filter_list[index].method
      );
      expect(errorCohortList[0].cohort.filters[index].arg).toEqual(
        bostonCohortDataContinuous.cohort_filter_list[index].arg
      );
    }
  });
  it("should be able to translate dataset categorical cohort", () => {
    const mockProp: IModelAssessmentDashboardProps = {
      cohortData: [bostonCohortDataCategorical]
    } as IModelAssessmentDashboardProps;
    const [errorCohortList, errorStrings] = processPreBuiltCohort(
      mockProp,
      mockJointDataset
    );
    expect(errorStrings.length).toBe(0);
    expect(errorCohortList.length).toBe(1);
    expect(errorCohortList[0].cohort.name).toBe(
      bostonCohortDataCategorical.name
    );
    expect(errorCohortList[0].cohort.filters.length).toBe(
      bostonCohortDataCategorical.cohort_filter_list.length
    );
    expect(errorCohortList[0].cohort.filters[0].column).toContain(
      JointDataset.DataLabelRoot
    );
    expect(errorCohortList[0].cohort.filters[0].method).toBe(
      bostonCohortDataCategorical.cohort_filter_list[0].method
    );
    expect(errorCohortList[0].cohort.filters[0].arg).toEqual([0, 1]);
  });
  it("should be able to translate regression error cohort", () => {
    const mockProp: IModelAssessmentDashboardProps = {
      cohortData: [bostonCohortDataRegressionError]
    } as IModelAssessmentDashboardProps;
    const [errorCohortList, errorStrings] = processPreBuiltCohort(
      mockProp,
      mockJointDataset
    );
    expect(errorStrings.length).toBe(0);
    expect(errorCohortList.length).toBe(1);
    expect(errorCohortList[0].cohort.name).toBe(
      bostonCohortDataRegressionError.name
    );
    expect(errorCohortList[0].cohort.filters.length).toBe(
      bostonCohortDataRegressionError.cohort_filter_list.length
    );
    expect(errorCohortList[0].cohort.filters[0].column).toBe(
      JointDataset.RegressionError
    );
    expect(errorCohortList[0].cohort.filters[0].method).toBe(
      bostonCohortDataRegressionError.cohort_filter_list[0].method
    );
    expect(errorCohortList[0].cohort.filters[0].arg).toEqual(
      bostonCohortDataRegressionError.cohort_filter_list[0].arg
    );
  });
  it("should be able to translate predicted y cohort", () => {
    const mockProp: IModelAssessmentDashboardProps = {
      cohortData: [bostonCohortDataPredictedY]
    } as IModelAssessmentDashboardProps;
    const [errorCohortList, errorStrings] = processPreBuiltCohort(
      mockProp,
      mockJointDataset
    );
    expect(errorStrings.length).toBe(0);
    expect(errorCohortList.length).toBe(1);
    expect(errorCohortList[0].cohort.name).toBe(
      bostonCohortDataPredictedY.name
    );
    expect(errorCohortList[0].cohort.filters.length).toBe(
      bostonCohortDataPredictedY.cohort_filter_list.length
    );
    expect(errorCohortList[0].cohort.filters[0].column).toBe(
      JointDataset.PredictedYLabel
    );
    expect(errorCohortList[0].cohort.filters[0].method).toBe(
      bostonCohortDataPredictedY.cohort_filter_list[0].method
    );
    expect(errorCohortList[0].cohort.filters[0].arg).toEqual(
      bostonCohortDataPredictedY.cohort_filter_list[0].arg
    );
  });
  it("should be able to translate true y cohort", () => {
    const mockProp: IModelAssessmentDashboardProps = {
      cohortData: [bostonCohortDataTrueY]
    } as IModelAssessmentDashboardProps;
    const [errorCohortList, errorStrings] = processPreBuiltCohort(
      mockProp,
      mockJointDataset
    );
    expect(errorStrings.length).toBe(0);
    expect(errorCohortList.length).toBe(1);
    expect(errorCohortList[0].cohort.name).toBe(bostonCohortDataTrueY.name);
    expect(errorCohortList[0].cohort.filters.length).toBe(
      bostonCohortDataTrueY.cohort_filter_list.length
    );
    expect(errorCohortList[0].cohort.filters[0].column).toBe(
      JointDataset.TrueYLabel
    );
    expect(errorCohortList[0].cohort.filters[0].method).toBe(
      bostonCohortDataTrueY.cohort_filter_list[0].method
    );
    expect(errorCohortList[0].cohort.filters[0].arg).toEqual(
      bostonCohortDataTrueY.cohort_filter_list[0].arg
    );
  });
});
