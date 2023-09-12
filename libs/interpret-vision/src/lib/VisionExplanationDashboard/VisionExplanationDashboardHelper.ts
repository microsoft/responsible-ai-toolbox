// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  FilterMethods,
  ICompositeFilter,
  IDataset,
  IFilter,
  IVisionListItem,
  JointDataset,
  Operations
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

import { IVisionExplanationDashboardProps } from "./Interfaces/IVisionExplanationDashboardProps";
import { IVisionExplanationDashboardState } from "./Interfaces/IVisionExplanationDashboardState";
import { getJoinedLabelString } from "./utils/labelUtils";

export enum VisionDatasetExplorerTabOptions {
  ImageExplorerView = "Image explorer view",
  TableView = "Table view",
  ClassView = "Class view"
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
  labels: number[] | number[][] | string[],
  classNames: string[]
): string[] | string[][] {
  if (Array.isArray(labels[0])) {
    return (labels as number[][]).map((row) =>
      row.reduce((acc, value, index) => {
        if (value) {
          acc.push(classNames[index]);
        }
        return acc;
      }, [] as string[])
    );
  }
  return (labels as number[]).map((index) => classNames[index]);
}

export function preprocessData(
  props: IVisionExplanationDashboardProps,
  dataset: IDataset
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
    return Number((featuresArr[0] as number).toFixed(2));
  });

  const fieldNames = dataSummary.feature_names;
  if (!features || !fieldNames) {
    return undefined;
  }
  const loadingExplanation: boolean[][] = [[]];
  const computedExplanations: Map<number, Map<number, string>> = new Map();
  dataSummary.images?.forEach((image, index) => {
    const defVal = localization.InterpretVision.Dashboard.notdefined;
    const y = dataset.object_detection_predicted_y?.[index];
    const odPredictedY = typeof y === "undefined" ? defVal : y;
    const x = dataset.object_detection_true_y?.[index];
    const odTrueY = typeof x === "undefined" ? defVal : x;

    const item: IVisionListItem = {
      image,
      index,
      odPredictedY,
      odTrueY,
      predictedY: predictedY[index],
      trueY: trueY[index]
    };
    fieldNames.forEach((fieldName) => {
      item[fieldName] = features[index];
    });
    const predictedYValue = getJoinedLabelString(item.predictedY);
    const trueYValue = getJoinedLabelString(item.trueY);
    predictedYValue === trueYValue
      ? successInstances.push(item)
      : errorInstances.push(item);

    loadingExplanation.push(
      new Array<boolean>(
        dataset.object_detection_predicted_y?.length ?? 0
      ).fill(true)
    );
    computedExplanations.set(index, new Map<number, string>());
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
      (row: { [key: string]: string | number }) => {
        return row[JointDataset.IndexLabel] as string | number;
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
  loadingExplanation: [[]],
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
