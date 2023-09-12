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

export function translateToNewFilter(
  legacyFilter: IFilter,
  featureNames?: string[]
): IFilter | undefined {
  const legacyColumn = legacyFilter.column;
  if (legacyColumn.startsWith(JointDataset.DataLabelRoot) && featureNames) {
    const index = legacyColumn.slice(JointDataset.DataLabelRoot.length);
    const newColumn = featureNames[Number(index)];
    return translateFilter(legacyFilter, newColumn);
  }
  const columnMap = new Map<string, string>([
    [JointDataset.IndexLabel, DatasetCohortColumns.Index],
    [JointDataset.PredictedYLabel, DatasetCohortColumns.PredictedY],
    [JointDataset.TrueYLabel, DatasetCohortColumns.TrueY],
    [
      JointDataset.ClassificationError,
      DatasetCohortColumns.ClassificationError
    ],
    [JointDataset.RegressionError, DatasetCohortColumns.RegressionError]
  ]);
  if (columnMap.has(legacyColumn)) {
    const label = columnMap.get(legacyColumn);
    return label ? translateFilter(legacyFilter, label) : undefined;
  }
  return undefined;
}

function translateToLegacyFilter(
  filter: IFilter,
  featureNames: string[]
): IFilter | undefined {
  const column = filter.column;
  const columnMap = new Map<string, string>([
    [DatasetCohortColumns.Index, JointDataset.IndexLabel],
    [DatasetCohortColumns.PredictedY, JointDataset.PredictedYLabel],
    [DatasetCohortColumns.TrueY, JointDataset.TrueYLabel],
    [
      DatasetCohortColumns.ClassificationError,
      JointDataset.ClassificationError
    ],
    [DatasetCohortColumns.RegressionError, JointDataset.RegressionError]
  ]);
  if (columnMap.has(column)) {
    const label = columnMap.get(column);
    return label ? translateFilter(filter, label) : undefined;
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

function translateFilter(filter: IFilter, column: string): IFilter {
  return {
    arg: filter.arg,
    column,
    method: filter.method
  };
}
