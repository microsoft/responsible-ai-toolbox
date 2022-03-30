// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ErrorCohort,
  JointDataset,
  IFilter,
  ModelTypes,
  FilterMethods,
  Cohort,
  IPreBuiltFilter
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

import { IModelAssessmentDashboardProps } from "../ModelAssessmentDashboardProps";

export enum CohortColumnNames {
  PredictedY = "Predicted Y",
  TrueY = "True Y",
  Index = "Index",
  ClassificationOutcome = "Classification outcome",
  RegressionError = "Error"
}

export function processPreBuiltCohort(
  props: IModelAssessmentDashboardProps,
  jointDataset: JointDataset
): [ErrorCohort[], string[]] {
  const errorStrings: string[] = [];
  const errorCohortList: ErrorCohort[] = [];
  if (props.cohortData) {
    for (const preBuiltCohort of props.cohortData) {
      const filterList: IFilter[] = [];
      for (const preBuiltCohortFilter of preBuiltCohort.cohort_filter_list) {
        switch (preBuiltCohortFilter.column) {
          case CohortColumnNames.PredictedY: {
            const filter = translatePreBuiltCohortFilterForTarget(
              preBuiltCohortFilter,
              jointDataset,
              CohortColumnNames.PredictedY
            );
            filterList.push(filter);
            break;
          }
          case CohortColumnNames.TrueY: {
            const filter = translatePreBuiltCohortFilterForTarget(
              preBuiltCohortFilter,
              jointDataset,
              CohortColumnNames.TrueY
            );
            filterList.push(filter);
            break;
          }
          case CohortColumnNames.ClassificationOutcome: {
            const filter =
              translatePreBuiltCohortFilterForClassificationOutcome(
                preBuiltCohortFilter,
                jointDataset
              );
            filterList.push(filter);
            break;
          }
          case CohortColumnNames.Index: {
            const filter: IFilter = {
              arg: preBuiltCohortFilter.arg,
              column: JointDataset.IndexLabel,
              method: preBuiltCohortFilter.method
            };
            filterList.push(filter);
            break;
          }
          case CohortColumnNames.RegressionError: {
            const filter: IFilter = {
              arg: preBuiltCohortFilter.arg,
              column: JointDataset.RegressionError,
              method: preBuiltCohortFilter.method
            };
            filterList.push(filter);
            break;
          }
          default: {
            const [filter, errorString] =
              translatePreBuiltCohortFilterForDataset(
                preBuiltCohortFilter,
                jointDataset
              );
            if (filter !== undefined) {
              filterList.push(filter);
            } else if (errorString !== undefined) {
              errorStrings.push(errorString);
            }

            break;
          }
        }
      }
      const errorCohortEntry = new ErrorCohort(
        new Cohort(preBuiltCohort.name, jointDataset, filterList),
        jointDataset
      );
      errorCohortList.push(errorCohortEntry);
    }
  }
  return [errorCohortList, errorStrings];
}

function translatePreBuiltCohortFilterForTarget(
  preBuiltCohortFilter: IPreBuiltFilter,
  jointDataset: JointDataset,
  cohortColumnName: CohortColumnNames
): IFilter {
  let filterColumnName = JointDataset.PredictedYLabel;
  if (cohortColumnName === CohortColumnNames.TrueY) {
    filterColumnName = JointDataset.TrueYLabel;
  }
  if (
    jointDataset.getModelType() === ModelTypes.Multiclass ||
    jointDataset.getModelType() === ModelTypes.Binary
  ) {
    const modelClasses = jointDataset.getModelClasses();
    const index: number[] = [];
    for (const modelClass of preBuiltCohortFilter.arg) {
      const indexModelClass = modelClasses.indexOf(modelClass);

      if (indexModelClass !== -1) {
        index.push(indexModelClass);
      }
    }

    index.sort((a, b) => a - b);

    const filter: IFilter = {
      arg: index,
      column: filterColumnName,
      method: preBuiltCohortFilter.method
    };
    return filter;
  }
  const filter: IFilter = {
    arg: preBuiltCohortFilter.arg,
    column: filterColumnName,
    method: preBuiltCohortFilter.method
  };
  return filter;
}

function translatePreBuiltCohortFilterForClassificationOutcome(
  preBuiltCohortFilter: IPreBuiltFilter,
  jointDataset: JointDataset
): IFilter {
  const index: number[] = [];
  if (jointDataset.metaDict[JointDataset.ClassificationError]) {
    const allowedClassificationErrorValues =
      jointDataset.metaDict[JointDataset.ClassificationError]
        .sortedCategoricalValues;

    if (allowedClassificationErrorValues !== undefined) {
      for (const classificationError of preBuiltCohortFilter.arg) {
        const indexclassificationError =
          allowedClassificationErrorValues.indexOf(classificationError);

        if (indexclassificationError !== -1) {
          index.push(indexclassificationError);
        }
      }
    }
  }
  index.sort((a, b) => a - b);
  const filter: IFilter = {
    arg: index,
    column: JointDataset.ClassificationError,
    method: preBuiltCohortFilter.method
  };
  return filter;
}

function translatePreBuiltCohortFilterForDataset(
  preBuiltCohortFilter: IPreBuiltFilter,
  jointDataset: JointDataset
): [IFilter | undefined, string | undefined] {
  let jointDatasetFeatureName = undefined;
  let userDatasetFeatureName = undefined;
  for (jointDatasetFeatureName in jointDataset.metaDict) {
    if (
      jointDataset.metaDict[jointDatasetFeatureName].abbridgedLabel ===
      preBuiltCohortFilter.column
    ) {
      userDatasetFeatureName =
        jointDataset.metaDict[jointDatasetFeatureName].abbridgedLabel;
      break;
    }
  }

  if (
    jointDatasetFeatureName === undefined ||
    userDatasetFeatureName === undefined
  ) {
    return [undefined, localization.Core.PreBuiltCohort.featureNameNotFound];
  }

  if (preBuiltCohortFilter.method === FilterMethods.Includes) {
    if (!jointDataset.metaDict[jointDatasetFeatureName].isCategorical) {
      return [
        undefined,
        localization.Core.PreBuiltCohort.notACategoricalFeature
      ];
    }
    const index: number[] = [];
    const categorcialValues =
      jointDataset.metaDict[jointDatasetFeatureName].sortedCategoricalValues;
    if (categorcialValues !== undefined) {
      for (const categoricalValue of preBuiltCohortFilter.arg) {
        const indexCategoricalValue =
          categorcialValues.indexOf(categoricalValue);
        if (indexCategoricalValue !== -1) {
          index.push(indexCategoricalValue);
        }
      }
      index.sort((a, b) => a - b);
      const filter: IFilter = {
        arg: index,
        column: jointDatasetFeatureName,
        method: preBuiltCohortFilter.method
      };
      return [filter, undefined];
    }
  }

  const filter: IFilter = {
    arg: preBuiltCohortFilter.arg,
    column: jointDatasetFeatureName,
    method: preBuiltCohortFilter.method
  };
  return [filter, undefined];
}
