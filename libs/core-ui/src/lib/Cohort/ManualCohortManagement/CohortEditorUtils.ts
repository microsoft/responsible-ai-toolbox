// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DatasetCohortColumns } from "../../DatasetCohortColumns";
import { IDataset } from "../../Interfaces/IDataset";
import { IExplanationModelMetadata } from "../../Interfaces/IExplanationContext";
import { IFilter } from "../../Interfaces/IFilter";
import { JointDataset } from "../../util/JointDataset";

import { ICohortEditorProps } from "./CohortEditor";

export function getFilters(
  props: ICohortEditorProps,
  dataset?: IDataset,
  metadata?: IExplanationModelMetadata
): IFilter[] {
  if (props.filterList === undefined) {
    return [];
  }
  if (props.isFromExplanation) {
    return translateToNewFilters(props.filterList, metadata?.featureNames);
  }
  return translateToNewFilters(props.filterList, dataset?.feature_names);
}

export function translateToLegacyFilterColumn(
  column: string,
  featureNames: string[]
): string {
  if (column === DatasetCohortColumns.Index) {
    return JointDataset.IndexLabel;
  }
  if (column === DatasetCohortColumns.PredictedY) {
    return JointDataset.PredictedYLabel;
  }
  if (column === DatasetCohortColumns.TrueY) {
    return JointDataset.TrueYLabel;
  }
  if (column === DatasetCohortColumns.ClassificationError) {
    return JointDataset.ClassificationError;
  }
  if (column === DatasetCohortColumns.RegressionError) {
    return JointDataset.RegressionError;
  }
  const index = featureNames.findIndex((item) => item === column);
  if (index > -1) {
    return JointDataset.DataLabelRoot + index.toString();
  }
  return "";
}

export function translateToNewFilters(
  legacyFilters: IFilter[],
  featureNames?: string[]
): IFilter[] {
  const filters: IFilter[] = [];
  legacyFilters.forEach((legacyFilter) => {
    const filter = translateToNewFilter(legacyFilter, featureNames);
    if (filter) {
      filters.push(filter);
    }
  });
  return filters;
}

export function translateToLegacyFilters(
  filters: IFilter[],
  featureNames: string[] | undefined
): IFilter[] {
  const legacyFilters: IFilter[] = [];
  filters.forEach((filter) => {
    const legacyFilter = translateToLegacyFilter(filter, featureNames || []);
    if (legacyFilter) {
      legacyFilters.push(legacyFilter);
    }
  });

  return legacyFilters;
}

function translateToLegacyFilter(
  filter: IFilter,
  featureNames: string[]
): IFilter | undefined {
  const column = filter.column;
  if (column === DatasetCohortColumns.Index) {
    return translateFilter(filter, JointDataset.IndexLabel);
  }
  if (column === DatasetCohortColumns.PredictedY) {
    return translateFilter(filter, JointDataset.PredictedYLabel);
  }
  if (column === DatasetCohortColumns.TrueY) {
    return translateFilter(filter, JointDataset.TrueYLabel);
  }
  if (column === DatasetCohortColumns.ClassificationError) {
    return translateFilter(filter, JointDataset.ClassificationError);
  }
  if (column === DatasetCohortColumns.RegressionError) {
    return translateFilter(filter, JointDataset.RegressionError);
  }
  const index = featureNames.findIndex((item) => item === column);
  if (index > -1) {
    return translateFilter(
      filter,
      JointDataset.DataLabelRoot + index.toString()
    );
  }
  return undefined;
}

function translateToNewFilter(
  legacyFilter: IFilter,
  featureNames?: string[]
): IFilter | undefined {
  const legacyColumn = legacyFilter.column;
  if (legacyColumn.startsWith(JointDataset.DataLabelRoot) && featureNames) {
    const index = legacyColumn.slice(JointDataset.DataLabelRoot.length);
    const newColumn = featureNames[Number(index)];
    return translateFilter(legacyFilter, newColumn);
  }
  if (legacyColumn === JointDataset.IndexLabel) {
    return translateFilter(legacyFilter, DatasetCohortColumns.Index);
  }
  if (legacyColumn === JointDataset.PredictedYLabel) {
    return translateFilter(legacyFilter, DatasetCohortColumns.PredictedY);
  }
  if (legacyColumn === JointDataset.TrueYLabel) {
    return translateFilter(legacyFilter, DatasetCohortColumns.TrueY);
  }
  if (legacyColumn === JointDataset.ClassificationError) {
    return translateFilter(
      legacyFilter,
      DatasetCohortColumns.ClassificationError
    );
  }
  if (legacyColumn === JointDataset.RegressionError) {
    return translateFilter(legacyFilter, DatasetCohortColumns.RegressionError);
  }
  return undefined;
}

function translateFilter(filter: IFilter, column: string): IFilter {
  return {
    arg: filter.arg,
    column,
    method: filter.method
  };
}
