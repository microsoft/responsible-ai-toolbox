// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ErrorCohort,
  JointDataset,
  IFilter,
  ModelTypes,
  FilterMethods,
  Cohort
} from "@responsible-ai/core-ui";

import { IModelAssessmentDashboardProps } from "../ModelAssessmentDashboardProps";

export function processPreBuiltCohort(
  props: IModelAssessmentDashboardProps,
  jointDataset: JointDataset
): ErrorCohort[] {
  const errorCohortList: ErrorCohort[] = [];
  if (props.cohortData !== undefined) {
    for (const preBuiltCohort of props.cohortData) {
      console.log(preBuiltCohort);
      const filterList: IFilter[] = [];
      for (const preBuiltCohortFilter of preBuiltCohort.cohort_filter_list) {
        switch (preBuiltCohortFilter.column) {
          case "Predicted Y": {
            switch (jointDataset.getModelType()) {
              case ModelTypes.Binary:
              case ModelTypes.Multiclass: {
                const modelClasses = jointDataset.getModelClasses();
                const index: number[] = [];
                for (const modelClass of preBuiltCohortFilter.arg) {
                  const indexModelClass = modelClasses.indexOf(modelClass);

                  if (indexModelClass !== -1) {
                    index.push(indexModelClass);
                  }
                }
                index.sort((a, b) => a - b);
                console.log(index);
                const filter: IFilter = {
                  arg: index,
                  column: JointDataset.PredictedYLabel,
                  method: preBuiltCohortFilter.method
                } as IFilter;
                filterList.push(filter);
                break;
              }
              default: {
                const filter: IFilter = {
                  arg: preBuiltCohortFilter.arg,
                  column: JointDataset.PredictedYLabel,
                  method: preBuiltCohortFilter.method
                } as IFilter;
                filterList.push(filter);
                break;
              }
            }
            break;
          }
          case "True Y": {
            switch (jointDataset.getModelType()) {
              case ModelTypes.Binary:
              case ModelTypes.Multiclass: {
                const modelClasses = jointDataset.getModelClasses();
                const index: number[] = [];
                for (const modelClass of preBuiltCohortFilter.arg) {
                  const indexModelClass = modelClasses.indexOf(modelClass);

                  if (indexModelClass !== -1) {
                    index.push(indexModelClass);
                  }
                }
                index.sort((a, b) => a - b);
                console.log(index);
                const filter: IFilter = {
                  arg: index,
                  column: JointDataset.TrueYLabel,
                  method: preBuiltCohortFilter.method
                } as IFilter;
                filterList.push(filter);
                break;
              }
              default: {
                const filter: IFilter = {
                  arg: preBuiltCohortFilter.arg,
                  column: JointDataset.TrueYLabel,
                  method: preBuiltCohortFilter.method
                } as IFilter;
                filterList.push(filter);
                break;
              }
            }
            break;
          }
          case "Classification Outcome": {
            console.log(preBuiltCohortFilter);
            const index: number[] = [];
            if (JointDataset.ClassificationError in jointDataset.metaDict) {
              const allowedCalssificationErrorValues =
                jointDataset.metaDict[JointDataset.ClassificationError]
                  .sortedCategoricalValues;

              if (allowedCalssificationErrorValues !== undefined) {
                for (const classificationError of preBuiltCohortFilter.arg) {
                  const indexclassificationError =
                    allowedCalssificationErrorValues.indexOf(
                      classificationError
                    );

                  if (indexclassificationError !== -1) {
                    index.push(indexclassificationError);
                  }
                }
              }
            }
            index.sort((a, b) => a - b);
            console.log(index);
            const filter: IFilter = {
              arg: index,
              column: JointDataset.ClassificationError,
              method: preBuiltCohortFilter.method
            } as IFilter;
            filterList.push(filter);
            break;
          }
          case "Index": {
            console.log(preBuiltCohortFilter);
            const filter: IFilter = {
              arg: preBuiltCohortFilter.arg,
              column: JointDataset.IndexLabel,
              method: preBuiltCohortFilter.method
            } as IFilter;
            filterList.push(filter);
            break;
          }
          case "Error": {
            console.log(preBuiltCohortFilter);
            const filter: IFilter = {
              arg: preBuiltCohortFilter.arg,
              column: JointDataset.RegressionError,
              method: preBuiltCohortFilter.method
            } as IFilter;
            filterList.push(filter);
            break;
          }
          default: {
            let jointDatasetFeatureName = undefined;
            let userDatasetFeatureName = undefined;
            for (jointDatasetFeatureName in jointDataset.metaDict) {
              userDatasetFeatureName =
                jointDataset.metaDict[jointDatasetFeatureName].abbridgedLabel;
              if (userDatasetFeatureName === preBuiltCohortFilter.column) {
                console.log(userDatasetFeatureName);
                break;
              }
            }
            console.log(jointDatasetFeatureName);
            console.log(userDatasetFeatureName);

            if (
              jointDatasetFeatureName === undefined ||
              userDatasetFeatureName === undefined
            ) {
              throw new Error("Feature name not found in the dataset");
            }

            if (preBuiltCohortFilter.method === FilterMethods.Includes) {
              if (
                !jointDataset.metaDict[jointDatasetFeatureName].isCategorical
              ) {
                // throw an error to the user
              } else {
                const index: number[] = [];
                const categorcialValues =
                  jointDataset.metaDict[jointDatasetFeatureName]
                    .sortedCategoricalValues;
                if (categorcialValues !== undefined) {
                  for (const categoricalValue of preBuiltCohortFilter.arg) {
                    const indexCategoricalValue =
                      categorcialValues.indexOf(categoricalValue);
                    if (indexCategoricalValue !== -1) {
                      index.push(indexCategoricalValue);
                    }
                  }
                  index.sort((a, b) => a - b);
                  console.log(index);
                  const filter: IFilter = {
                    arg: index,
                    column: jointDatasetFeatureName,
                    method: preBuiltCohortFilter.method
                  } as IFilter;
                  filterList.push(filter);
                }
              }
            } else {
              const filter: IFilter = {
                arg: preBuiltCohortFilter.arg,
                column: jointDatasetFeatureName,
                method: preBuiltCohortFilter.method
              } as IFilter;
              filterList.push(filter);
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
      console.log(errorCohortEntry);
    }
  }
  return errorCohortList;
}
