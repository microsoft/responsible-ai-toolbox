// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  CheckboxVisibility,
  IColumn,
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode
} from "@fluentui/react";
import {
  Cohort,
  CohortEditor,
  DatasetCohort,
  defaultModelAssessmentContext,
  ErrorCohort,
  getCohortFilterCount,
  IModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { CohortDeleteDialog } from "./CohortDeleteDialog";
import { CohortListItem } from "./CohortListItem";

export interface ICohortListProps {
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
    this.state = { currentEditCohort: undefined };
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
        {this.state.currentEditCohort && (
          <CohortEditor
            dataset={this.context.dataset}
            isFromExplanation={false}
            jointDataset={this.context.jointDataset}
            filterList={this.state.currentEditCohort.cohort.filters}
            compositeFilters={
              this.state.currentEditCohort.cohort.compositeFilters
            }
            cohortName={this.state.currentEditCohort.cohort.name}
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
    return (
      <CohortListItem
        item={item}
        index={index}
        column={column}
        enableEditing={this.props.enableEditing}
        getAllCohort={this.getAllCohort}
        onEditCohortClick={this.onEditCohortClick}
        onDeleteCohortClick={this.onDeleteCohortClick}
      />
    );
  };

  private getAllCohort = (): ErrorCohort[] => {
    return this.context.errorCohorts.filter(
      (errorCohort) => !errorCohort.isTemporary
    );
  };

  private onEditCohortClick = (index: number): void => {
    const all = this.getAllCohort();
    const cohort = index >= 0 && index < all.length && all[index];
    if (cohort) {
      this.setState({ currentEditCohort: cohort });
    }
  };

  private onDeleteCohortClick = (index: number): void => {
    const all = this.getAllCohort();
    this.setState({
      currentDeleteCohortName: all[index].cohort.name,
      currentDeleteIndex: index
    });
  };

  private onDismissDelete = (): void => {
    this.setState({ currentDeleteIndex: undefined });
  };

  private onDeleteCohort = (): void => {
    if (this.state.currentDeleteIndex !== undefined) {
      const index = this.state.currentDeleteIndex;
      const all = this.getAllCohort();
      const cohort = index >= 0 && index < all.length && all[index];
      if (cohort) {
        this.context.deleteCohort(cohort);
      }
      this.setState({ currentDeleteIndex: undefined });
    }
  };

  private getCohortListItems(): ICohortListItem[] {
    const allItems = this.context.errorCohorts
      .filter(
        (errorCohort: ErrorCohort) =>
          this.props.showAllDataCohort || !errorCohort.isAllDataCohort
      )
      .filter((errorCohort: ErrorCohort) => !errorCohort.isTemporary)
      .map((errorCohort: ErrorCohort, index: number) => {
        const details = [
          localization.formatString(
            localization.Interpret.CohortBanner.datapoints,
            errorCohort.cohort.filteredData.length
          ),
          localization.formatString(
            localization.Interpret.CohortBanner.filters,
            getCohortFilterCount(errorCohort.cohort)
          )
        ];
        return {
          coverage: errorCohort.cohortStats.errorCoverage.toFixed(2),
          details,
          key: index,
          metricName: errorCohort.cohortStats.metricName,
          metricValue: errorCohort.cohortStats.metricValue.toFixed(2),
          name: errorCohort.cohort.name
        };
      });
    return allItems;
  }

  private saveEditedCohort = (
    cohort: Cohort,
    datasetCohort?: DatasetCohort,
    switchNew?: boolean
  ): void => {
    this.context.editCohort(cohort, datasetCohort, switchNew);
    this.toggleEditPanel();
  };

  private toggleEditPanel = (): void => {
    this.setState({ currentEditCohort: undefined });
  };
}
