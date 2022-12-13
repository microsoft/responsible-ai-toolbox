// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  FilterMethods,
  ICompositeFilter,
  IFilter,
  IVisionListItem,
  JointDataset,
  Operations
} from "@responsible-ai/core-ui";

import { IVisionExplanationDashboardProps } from "./Interfaces/IVisionExplanationDashboardProps";
import { IVisionExplanationDashboardState } from "./Interfaces/IVisionExplanationDashboardState";

export enum VisionDatasetExplorerTabOptions {
  ImageExplorerView = "Image explorer view",
  TableView = "Table view",
  DataCharacteristics = "Data characteristics"
}

export enum TitleBarOptions {
  Error,
  Success
}

export const defaultImageSizes = {
  dataCharacteristics: 100,
  imageExplorerView: 200,
  tableView: 50
};

export function mapClassNames(
  labels: number[] | number[][],
  classNames: string[]
): string[] | string[][] {
  if (Array.isArray(labels[0])) {
    return (labels as number[][]).map((row) =>
      row.map((index) => classNames[index])
    );
  }
  return (labels as number[]).map((index) => classNames[index]);
}

export function preprocessData(
  props: IVisionExplanationDashboardProps
):
  | Pick<
      IVisionExplanationDashboardState,
      | "computedExplanations"
      | "errorInstances"
      | "loadingExplanation"
      | "otherMetadataFieldNames"
      | "successInstances"
    >
  | undefined {
  const dataSummary = props.dataSummary;
  const errorInstances: IVisionListItem[] = [];
  const successInstances: IVisionListItem[] = [];
  const classNames = props.dataSummary.class_names;

  const predictedY = mapClassNames(dataSummary.predicted_y, classNames);

  const trueY = mapClassNames(dataSummary.true_y, classNames);

  const features = dataSummary.features?.map((featuresArr) => {
    return featuresArr[0] as number;
  });

  const fieldNames = dataSummary.feature_names;
  if (!features || !fieldNames) {
    return undefined;
  }
  const loadingExplanation: boolean[] = [];
  const computedExplanations: Map<number, string> = new Map();
  dataSummary.images?.forEach((image, index) => {
    const item: IVisionListItem = {
      image,
      index,
      predictedY: predictedY[index],
      trueY: trueY[index]
    };
    fieldNames.forEach((fieldName) => {
      item[fieldName] = features[index];
    });
    item.predictedY === item.trueY
      ? successInstances.push(item)
      : errorInstances.push(item);

    loadingExplanation.push(false);
    computedExplanations.set(index, "");
  });

  return {
    computedExplanations,
    errorInstances,
    loadingExplanation,
    otherMetadataFieldNames: fieldNames,
    successInstances
  };
}

export function getItems(
  props: IVisionExplanationDashboardProps,
  originalErrorInstances: IVisionListItem[],
  originalSuccessInstances: IVisionListItem[]
): Pick<
  IVisionExplanationDashboardState,
  "errorInstances" | "successInstances"
> {
  const indices = new Set(
    props.selectedCohort.cohort.filteredData.map(
      (row: { [key: string]: number }) => {
        return row[JointDataset.IndexLabel] as number;
      }
    )
  );

  let errorInstances = originalErrorInstances;
  let successInstances = originalSuccessInstances;

  errorInstances = errorInstances.filter((item: IVisionListItem) =>
    indices.has(item.index)
  );
  successInstances = successInstances.filter((item: IVisionListItem) =>
    indices.has(item.index)
  );
  return {
    errorInstances: [...errorInstances],
    successInstances: [...successInstances]
  };
}

export function getCohort(
  name: string,
  selectedIndices: number[],
  jointDataset: JointDataset
): Cohort {
  const filters: IFilter[] = [];
  selectedIndices.forEach((index) => {
    const filter: IFilter = {
      arg: [index],
      column: "Index",
      method: FilterMethods.Equal
    };
    filters.push(filter);
  });
  const compositeFilter: ICompositeFilter = {
    compositeFilters: filters,
    operation: Operations.Or
  };
  const cohort = new Cohort(name, jointDataset, [], [compositeFilter]);
  return cohort;
}

export const defaultState: IVisionExplanationDashboardState = {
  computedExplanations: new Map(),
  errorInstances: [],
  imageDim: 200,
  loadingExplanation: [],
  numRows: 3,
  otherMetadataFieldNames: ["mean_pixel_value"],
  pageSize: 10,
  panelOpen: false,
  searchValue: "",
  selectedIndices: [],
  selectedItem: undefined,
  selectedKey: VisionDatasetExplorerTabOptions.ImageExplorerView,
  successInstances: []
};
