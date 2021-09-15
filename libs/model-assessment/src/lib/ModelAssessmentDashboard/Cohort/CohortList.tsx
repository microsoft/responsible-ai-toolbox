// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  CohortEditor,
  defaultModelAssessmentContext,
  ErrorCohort,
  IModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import {
  IColumn,
  CheckboxVisibility,
  DetailsList,
  DetailsListLayoutMode,
  Link,
  Stack,
  Text,
  SelectionMode,
  IconButton
} from "office-ui-fabric-react";
import React from "react";

import { CohortDeleteDialog } from "./CohortDeleteDialog";
import { cohortListStyles } from "./CohortList.styles";

export interface ICohortListProps {
  onEditCohortClick?: (editedCohort: ErrorCohort) => void;
  onRemoveCohortClick?: (editedCohort: ErrorCohort) => void;
  enableEditing: boolean;
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
        maxWidth: 200,
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
          onRenderItemColumn={this.renderItemColumn.bind(this)}
        />
        {this.state.currentEditCohort && (
          <CohortEditor
            jointDataset={this.context.jointDataset}
            filterList={this.state.currentEditCohort.cohort.filters}
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
            onDeleteClick={this.onDeleteCohort.bind(this)}
            onDismiss={this.onDismissDelete.bind(this)}
          />
        )}
      </>
    );
  }

  private renderItemColumn(
    item: ICohortListItem,
    index: number | undefined,
    column: IColumn | undefined
  ): React.ReactNode {
    const style = cohortListStyles();
    if (column !== undefined && index !== undefined) {
      const fieldContent = item[
        column.fieldName as keyof ICohortListItem
      ] as string;

      switch (column.key) {
        case "nameColumn":
          if (this.props.enableEditing && item.name !== "All data") {
            return (
              <Stack className={style.link} horizontal={false}>
                <Stack.Item>
                  <span>{fieldContent}</span>
                </Stack.Item>
                <Stack.Item>
                  <Stack horizontal tokens={{ childrenGap: "10px" }}>
                    <Stack.Item>
                      <Link
                        onClick={this.onEditCohortClick.bind(this, item.key)}
                        disabled={this.isActiveCohort(item.key)}
                      >
                        {localization.Interpret.CohortBanner.edit}
                      </Link>
                    </Stack.Item>
                    <Stack.Item>
                      <Link
                        onClick={this.onDuplicateCohortClick.bind(
                          this,
                          item.key
                        )}
                      >
                        {localization.Interpret.CohortBanner.duplicateCohort}
                      </Link>
                    </Stack.Item>
                  </Stack>
                </Stack.Item>
              </Stack>
            );
          }
          return <span>{fieldContent}</span>;
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
                <Stack.Item>
                  <IconButton
                    iconProps={{ iconName: "Trash" }}
                    disabled={this.isActiveCohort(item.key)}
                    onClick={this.onDeleteCohortClick.bind(this, item.key)}
                  />
                </Stack.Item>
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
  }

  private getAllCohort(): ErrorCohort[] {
    return this.context.errorCohorts.filter(
      (errorCohort) => !errorCohort.isTemporary
    );
  }

  private onDuplicateCohortClick(index: number): void {
    const all = this.getAllCohort();
    if (index >= 0 && index < all.length) {
      const originCohort = all[index];
      const newCohort = new Cohort(
        `${originCohort.cohort.name} copy`,
        this.context.jointDataset,
        originCohort.cohort.filters
      );
      this.context.addCohort(newCohort);
    }
  }

  private onEditCohortClick(index: number): void {
    const all = this.getAllCohort();
    const cohort = index >= 0 && index < all.length && all[index];
    if (cohort) {
      this.setState({ currentEditCohort: cohort });
    }
  }

  private isActiveCohort(index: number): boolean {
    const all = this.getAllCohort();
    if (index >= 0 && index < all.length) {
      const targetCohort = all[index];
      return !!(
        targetCohort.cohort.name === this.context.baseErrorCohort.cohort.name ||
        targetCohort.cohort.name ===
          this.context.selectedErrorCohort.cohort.name
      );
    }
    return false;
  }

  private onDeleteCohortClick(index: number): void {
    const all = this.getAllCohort();
    this.setState({
      currentDeleteCohortName: all[index].cohort.name,
      currentDeleteIndex: index
    });
  }

  private onDismissDelete(): void {
    this.setState({ currentDeleteIndex: undefined });
  }

  private onDeleteCohort(): void {
    if (this.state.currentDeleteIndex !== undefined) {
      const index = this.state.currentDeleteIndex;
      const all = this.getAllCohort();
      const cohort = index >= 0 && index < all.length && all[index];
      if (cohort) {
        this.context.deleteCohort(cohort);
      }
      this.setState({ currentDeleteIndex: undefined });
    }
  }

  private getCohortListItems(): ICohortListItem[] {
    const allItems = this.context.errorCohorts
      .filter((errorCohort: ErrorCohort) => !errorCohort.isTemporary)
      .map((errorCohort: ErrorCohort, index: number) => {
        const details = [
          localization.formatString(
            localization.Interpret.CohortBanner.datapoints,
            errorCohort.cohort.filteredData.length
          ),
          localization.formatString(
            localization.Interpret.CohortBanner.filters,
            errorCohort.cohort.filters.length
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

  private saveEditedCohort = (cohort: Cohort) => {
    this.context.editCohort(cohort);
    this.toggleEditPanel();
  };

  private toggleEditPanel = () => {
    this.setState({ currentEditCohort: undefined });
  };
}
