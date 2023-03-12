// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  CheckboxVisibility,
  IColumn,
  DetailsList,
  DetailsListLayoutMode,
  Stack,
  Text,
  SelectionMode
} from "@fluentui/react";
import {
  Cohort,
  CohortEditor,
  CohortNameColumn,
  DatasetCohort,
  defaultModelAssessmentContext,
  ErrorCohort,
  IModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import {
  getDatasetCohortListItems,
  getErrorCohortListItems
} from "../utils/getCohortListItems";

import { CohortDeleteDialog } from "./CohortDeleteDialog";
import { cohortListStyles } from "./CohortList.styles";
import { CohortListDeleteButton } from "./CohortListDeleteButton";

export interface ICohortListProps {
  onEditCohortClick?: (editedCohort: ErrorCohort) => void;
  onRemoveCohortClick?: (editedCohort: ErrorCohort) => void;
  enableEditing: boolean;
  showAllDataCohort: boolean;
}

export interface ICohortListItem {
  key: number;
  name: string;
  coverage: string;
  metricName: string;
  metricValue: string;
  details?: string[];
}

interface ICohortListState {
  currentEditCohort?: ErrorCohort;
  currentEditDatasetCohort?: DatasetCohort;
  currentDeleteIndex?: number;
  currentDeleteCohortName?: string;
}

export class CohortList extends React.Component<
  ICohortListProps,
  ICohortListState
> {
  public static contextType = ModelAssessmentContext;
  public context: IModelAssessmentContext = defaultModelAssessmentContext;
  public constructor(props: ICohortListProps) {
    super(props);
    this.state = {
      currentEditCohort: undefined,
      currentEditDatasetCohort: undefined
    };
  }
  public render(): React.ReactNode {
    const columns = [
      {
        fieldName: "name",
        isResizable: true,
        key: "nameColumn",
        maxWidth: 400,
        minWidth: 50,
        name: "Name"
      },
      {
        fieldName: "details",
        isResizable: true,
        key: "detailsColumn",
        maxWidth: 100,
        minWidth: 75,
        name: "Details"
      }
    ];
    const items = this.getCohortListItems();
    const cohortName = this.context.isRefactorFlightOn
      ? this.state.currentEditDatasetCohort?.name
      : this.state.currentEditCohort?.cohort.name;
    const isEditing = this.context.isRefactorFlightOn
      ? this.state.currentEditDatasetCohort
      : this.state.currentEditCohort;
    return (
      <>
        <DetailsList
          items={items}
          columns={columns}
          setKey="set"
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          checkboxVisibility={CheckboxVisibility.hidden}
          onRenderItemColumn={this.renderItemColumn}
        />
        {isEditing && (
          <CohortEditor
            jointDataset={this.context.jointDataset}
            legacyFilterList={this.state.currentEditCohort?.cohort.filters}
            filterList={this.state.currentEditDatasetCohort?.filters}
            compositeFilters={
              this.state.currentEditCohort?.cohort.compositeFilters
            }
            cohortName={cohortName || ""}
            onSave={this.saveEditedCohort}
            isNewCohort={false}
            disableEditName
            deleteIsDisabled
            closeCohortEditor={this.toggleEditPanel}
            closeCohortEditorPanel={this.toggleEditPanel}
          />
        )}
        {this.state.currentDeleteIndex !== undefined && (
          <CohortDeleteDialog
            currentDeleteIndex={this.state.currentDeleteIndex}
            currentDeleteCohortName={this.state.currentDeleteCohortName}
            onDeleteClick={this.onDeleteCohort}
            onDismiss={this.onDismissDelete}
          />
        )}
      </>
    );
  }

  private renderItemColumn = (
    item: ICohortListItem,
    index: number | undefined,
    column: IColumn | undefined
  ): React.ReactNode => {
    const style = cohortListStyles();
    if (column !== undefined && index !== undefined) {
      const fieldContent = item[
        column.fieldName as keyof ICohortListItem
      ] as string;

      switch (column.key) {
        case "nameColumn":
          if (
            this.props.enableEditing &&
            item.name !== localization.ErrorAnalysis.Cohort.defaultLabel
          ) {
            return (
              <Stack className={style.link} horizontal={false}>
                <Stack.Item>
                  <span>{fieldContent}</span>
                </Stack.Item>
                <Stack.Item>
                  <Stack horizontal tokens={{ childrenGap: "10px" }}>
                    <Stack.Item>
                      <CohortNameColumn
                        disabled={this.isActiveCohort(item.key)}
                        fieldContent={localization.Interpret.CohortBanner.edit}
                        name={item.key}
                        onClick={this.onEditCohortClick}
                      />
                    </Stack.Item>
                    <Stack.Item>
                      <CohortNameColumn
                        fieldContent={
                          localization.Interpret.CohortBanner.duplicateCohort
                        }
                        name={item.key}
                        onClick={this.onDuplicateCohortClick}
                      />
                    </Stack.Item>
                  </Stack>
                </Stack.Item>
              </Stack>
            );
          }
          return <span className={style.link}>{fieldContent}</span>;
        case "detailsColumn":
          if (item.details && item.details.length === 2 && index !== 0) {
            return (
              <Stack horizontal tokens={{ childrenGap: "15px" }}>
                <Stack.Item>
                  <Stack horizontal={false}>
                    <Stack.Item>
                      <Text variant={"xSmall"}>{item.details[0]}</Text>
                    </Stack.Item>
                    <Stack.Item>
                      <Text variant={"xSmall"}>{item.details[1]}</Text>
                    </Stack.Item>
                  </Stack>
                </Stack.Item>
                {this.props.enableEditing && (
                  <Stack.Item>
                    <CohortListDeleteButton
                      disabled={this.isActiveCohort(item.key)}
                      itemKey={item.key}
                      onDeleteCohortClick={this.onDeleteCohortClick}
                    />
                  </Stack.Item>
                )}
              </Stack>
            );
          }
          if (item.details && item.details.length === 2) {
            return (
              <Stack horizontal={false}>
                <Stack.Item>
                  <Text variant={"xSmall"}>{item.details[0]}</Text>
                </Stack.Item>
                <Stack.Item>
                  <Text variant={"xSmall"}>{item.details[1]}</Text>
                </Stack.Item>
              </Stack>
            );
          }
          return <span>{fieldContent}</span>;
        default:
          return <span>{fieldContent}</span>;
      }
    }
    return React.Fragment;
  };

  private getAllCohort(): ErrorCohort[] {
    return this.context.errorCohorts.filter(
      (errorCohort) => !errorCohort.isTemporary
    );
  }

  private getAllDatasetCohorts(): DatasetCohort[] {
    return (
      this.context.datasetCohorts?.filter(
        (datasetCohort) => !datasetCohort.isTemporary
      ) || []
    );
  }

  private onDuplicateCohortClick = (index: number): void => {
    const allCohorts = this.getAllCohort();
    const allDatasetCohorts = this.getAllDatasetCohorts();
    const all = this.context.isRefactorFlightOn
      ? allDatasetCohorts
      : allCohorts;
    if (index >= 0 && index < all.length) {
      const originCohort = allCohorts[index];
      const originDatasetCohort = allDatasetCohorts[index];
      const cohortName = this.context.isRefactorFlightOn
        ? originDatasetCohort.name
        : originCohort.cohort.name;
      const duplicatedCohortNameStub =
        cohortName + localization.Interpret.CohortBanner.copy;
      let duplicatedCohortName = duplicatedCohortNameStub;
      let cohortCopyIndex = 0;
      while (
        this.context.isRefactorFlightOn
          ? this.existsDatasetCohort(allDatasetCohorts, duplicatedCohortName)
          : this.existsCohort(allCohorts, duplicatedCohortName)
      ) {
        cohortCopyIndex++;
        duplicatedCohortName = `${duplicatedCohortNameStub}(${cohortCopyIndex})`;
      }
      const newCohort = new Cohort(
        duplicatedCohortName,
        this.context.jointDataset,
        originCohort.cohort.filters
      );
      const newDatasetCohort = new DatasetCohort(
        duplicatedCohortName,
        this.context.dataset,
        originDatasetCohort.filters,
        this.context.modelType,
        this.context.columnRanges
      );

      this.context.addCohort(newCohort, false, newDatasetCohort);
    }
  };

  private existsCohort(cohorts: ErrorCohort[], name: string): boolean {
    return cohorts.some((errorCohort) => {
      return errorCohort.cohort.name === name;
    });
  }

  private existsDatasetCohort(
    datasetCohorts: DatasetCohort[],
    name: string
  ): boolean {
    return datasetCohorts.some((datasetCohorts) => {
      return datasetCohorts.name === name;
    });
  }

  private onEditCohortClick = (index: number): void => {
    const allCohorts = this.getAllCohort();
    const cohort = index >= 0 && index < allCohorts.length && allCohorts[index];
    if (cohort) {
      this.setState({ currentEditCohort: cohort });
    }
    const allDatasetCohorts = this.getAllDatasetCohorts();
    const datasetCohort =
      index >= 0 &&
      index < allDatasetCohorts.length &&
      allDatasetCohorts[index];
    if (datasetCohort) {
      this.setState({ currentEditDatasetCohort: datasetCohort });
    }
  };

  private isActiveCohort(index: number): boolean {
    if (this.context.isRefactorFlightOn) {
      const all = this.getAllCohort();
      if (index >= 0 && index < all.length) {
        const targetCohort = all[index];
        return !!(
          targetCohort.cohort.name ===
            this.context.baseErrorCohort.cohort.name ||
          targetCohort.cohort.name ===
            this.context.selectedErrorCohort.cohort.name
        );
      }
    } else {
      const allDatasetCohorts = this.getAllDatasetCohorts();
      if (index >= 0 && index < allDatasetCohorts.length) {
        const target = allDatasetCohorts[index];
        return !!(
          target.name === this.context.baseDatasetCohort?.name ||
          target.name === this.context.selectedDatasetCohort?.name
        );
      }
    }
    return false;
  }

  private onDeleteCohortClick = (index: number): void => {
    const allCohorts = this.getAllCohort();
    const allDatasetCohorts = this.getAllDatasetCohorts();
    this.setState({
      currentDeleteCohortName: this.context.isRefactorFlightOn
        ? allDatasetCohorts[index].name
        : allCohorts[index].cohort.name,
      currentDeleteIndex: index
    });
  };

  private onDismissDelete = (): void => {
    this.setState({ currentDeleteIndex: undefined });
  };

  private onDeleteCohort = (): void => {
    if (this.state.currentDeleteIndex !== undefined) {
      const index = this.state.currentDeleteIndex;
      const allCohorts = this.getAllCohort();
      const cohort =
        index >= 0 && index < allCohorts.length && allCohorts[index];
      const allDatasetCohorts = this.getAllDatasetCohorts();
      const datasetCohort =
        index >= 0 &&
        index < allDatasetCohorts.length &&
        allDatasetCohorts[index];
      if (cohort) {
        this.context.deleteCohort(cohort, true);
      }
      if (datasetCohort) {
        this.context.deleteCohort(datasetCohort, false);
      }
      this.setState({ currentDeleteIndex: undefined });
    }
  };

  private getCohortListItems(): ICohortListItem[] {
    if (this.context.isRefactorFlightOn) {
      return this.context.datasetCohorts
        ? getDatasetCohortListItems(this.context.datasetCohorts)
        : [];
    }
    return getErrorCohortListItems(
      this.context.errorCohorts,
      this.props.showAllDataCohort
    );
  }

  private saveEditedCohort = (
    cohort: Cohort,
    datasetCohort?: DatasetCohort,
    switchNew?: boolean
  ): void => {
    this.context.editCohort(cohort, switchNew, datasetCohort);
    this.toggleEditPanel();
  };

  private toggleEditPanel = (): void => {
    this.setState({
      currentEditCohort: undefined,
      currentEditDatasetCohort: undefined
    });
  };
}
