// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDropdownOption } from "@fluentui/react";
import { ErrorCohort } from "@responsible-ai/core-ui";

export const selectAllOptionKey = "selectAll";

export function getInitialNewlySelectedDatasetCohorts(
  selectedDatasetCohorts: number[] | undefined,
  datasetCohorts: ErrorCohort[]
): number[] {
  return (
    selectedDatasetCohorts ??
    datasetCohorts.map((errorCohort) => errorCohort.cohort.getCohortID())
  );
}

export function getInitialNewlySelectedFeatureCohorts(
  selectedFeatureBasedCohorts: number[] | undefined,
  featureBasedCohorts: ErrorCohort[]
): number[] {
  return (
    selectedFeatureBasedCohorts ?? featureBasedCohorts.map((_, index) => index)
  );
}

export function makeChartCohortOptionSelectionChange(
  currentlySelected: number[],
  allItems: number[],
  item: IDropdownOption
): number[] {
  if (item.key === selectAllOptionKey) {
    // if all items were selected before then unselect all now
    // if at least some items were not selected before then select all now
    if (currentlySelected.length !== allItems.length) {
      return allItems;
    }
    return [];
  }
  const key = Number(item.key);

  if (item.selected && !currentlySelected.includes(key)) {
    // update with newly selected item
    return currentlySelected.concat([key]);
  } else if (!item.selected && currentlySelected.includes(key)) {
    // update by removing the unselected item
    return currentlySelected.filter((idx) => idx !== key);
  }

  return currentlySelected;
}

export function getIndexAndNames(
  errorCohorts: ErrorCohort[]
): IDropdownOption[] {
  return errorCohorts.map((cohort, index) => {
    return { key: index.toString(), text: cohort.cohort.name };
  });
}

export function getIdAndNames(errorCohorts: ErrorCohort[]): IDropdownOption[] {
  return errorCohorts.map((errorCohort) => {
    return {
      key: errorCohort.cohort.getCohortID().toString(),
      text: errorCohort.cohort.name
    };
  });
}

export function getMaxCohortId(cohorts: ErrorCohort[]): number {
  return Math.max(
    ...cohorts.map((errorCohort) => errorCohort.cohort.getCohortID())
  );
}

export function noCohortIsSelected(
  datasetCohortViewIsNewlySelected: boolean,
  newlySelectedDatasetCohorts: number[],
  newlySelectedFeatureBasedCohorts: number[]
): boolean {
  return (
    (datasetCohortViewIsNewlySelected &&
      newlySelectedDatasetCohorts.length === 0) ||
    (!datasetCohortViewIsNewlySelected &&
      newlySelectedFeatureBasedCohorts.length === 0)
  );
}
