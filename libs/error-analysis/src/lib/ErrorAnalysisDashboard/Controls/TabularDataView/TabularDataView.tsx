// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ConstrainMode,
  DetailsList,
  DetailsListLayoutMode,
  IDetailsHeaderProps,
  IDetailsColumnRenderTooltipProps,
  Selection,
  SelectionMode,
  Fabric,
  MarqueeSelection,
  ScrollablePane,
  ScrollbarVisibility,
  TooltipHost,
  IRenderFunction,
  SelectAllVisibility
} from "@fluentui/react";
import {
  JointDataset,
  ErrorCohort,
  constructRows,
  constructCols,
  rowsFromCustomPoints,
  ITableState
} from "@responsible-ai/core-ui";
import _ from "lodash";
import React from "react";

import { HelpMessageDict } from "../../Interfaces/IStringsParam";

import { tabularDataViewStyles } from "./TabularDataView.styles";

export interface ITabularDataViewProps {
  messages?: HelpMessageDict;
  features: string[];
  jointDataset: JointDataset;
  dataView: DataViewKeys;
  setSelectedIndexes: (indexes: number[]) => void;
  selectedIndexes: number[];
  allSelectedIndexes?: number[];
  customPoints?: Array<{ [key: string]: any }>;
  selectedCohort: ErrorCohort;
  setWhatIfDatapoint?: (index: number) => void;
}

export interface ITabularDataViewState {
  tableState: ITableState;
}

export enum DataViewKeys {
  SelectedInstances = "SelectedInstances",
  CorrectInstances = "CorrectInstances",
  IncorrectInstances = "IncorrectInstances"
}

const onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps> = (
  props,
  defaultRender
) => {
  if (!props) {
    return <div />;
  }
  const onRenderColumnHeaderTooltip: IRenderFunction<IDetailsColumnRenderTooltipProps> =
    (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />;
  return (
    <div>
      {defaultRender?.({
        ...props,
        onRenderColumnHeaderTooltip,
        selectAllVisibility: SelectAllVisibility.hidden
      })}
    </div>
  );
};

export class TabularDataView extends React.Component<
  ITabularDataViewProps,
  ITabularDataViewState
> {
  private _selection: Selection;
  public constructor(props: ITabularDataViewProps) {
    super(props);
    const tableState = this.updateItems();
    this.state = {
      tableState
    };
    this._selection = new Selection({
      onSelectionChanged: (): void => {
        const selectionDetails = this.getSelectionDetails();
        this.props.setSelectedIndexes(selectionDetails);
        this.props.setWhatIfDatapoint?.(selectionDetails[0]);
      }
    });
    this.updateSelection();
  }

  public componentDidUpdate(prevProps: ITabularDataViewProps): void {
    if (
      this.props.customPoints !== prevProps.customPoints ||
      this.props.selectedCohort !== prevProps.selectedCohort ||
      !_.isEqual(this.props.selectedIndexes, prevProps.selectedIndexes)
    ) {
      const newTableState = this.updateItems();
      this.setState({ tableState: newTableState }, () => {
        this.updateSelection();
      });
    }
  }

  public render(): React.ReactNode {
    const classNames = tabularDataViewStyles();
    return (
      <div className={classNames.mainScrollBarPane}>
        <Fabric>
          <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
            <MarqueeSelection selection={this._selection}>
              <DetailsList
                items={this.state.tableState.rows}
                columns={this.state.tableState.columns}
                setKey="set"
                layoutMode={DetailsListLayoutMode.fixedColumns}
                constrainMode={ConstrainMode.unconstrained}
                onRenderDetailsHeader={
                  this.props.customPoints ? undefined : onRenderDetailsHeader
                }
                selectionPreservedOnEmptyClick
                ariaLabelForSelectionColumn="Toggle selection"
                ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                checkButtonAriaLabel="Row checkbox"
                selectionMode={
                  this.props.customPoints
                    ? SelectionMode.none
                    : SelectionMode.multiple
                }
                selection={this._selection}
                onItemInvoked={this.onItemInvoked}
              />
            </MarqueeSelection>
          </ScrollablePane>
        </Fabric>
      </div>
    );
  }

  private updateItems(): ITableState {
    let rows = [];
    let isCustomPointsView = false;
    if (this.props.customPoints) {
      const viewedRows = this.props.customPoints.length;
      rows = rowsFromCustomPoints(
        this.props.jointDataset,
        this.props.customPoints,
        viewedRows
      );
      isCustomPointsView = true;
    } else {
      this.props.selectedCohort.cohort.sort();
      const cohortData = this.props.selectedCohort.cohort.filteredData;
      const numRows: number = cohortData.length;
      let viewedRows: number = numRows;
      if (this.props.allSelectedIndexes) {
        viewedRows = Math.min(numRows, this.props.allSelectedIndexes.length);
      }
      rows = constructRows(
        cohortData,
        this.props.jointDataset,
        viewedRows,
        this.tabularDataFilter,
        this.props.allSelectedIndexes
      );
    }

    const numCols: number = this.props.jointDataset.datasetFeatureCount;
    const featureNames: string[] = this.props.features;
    // TODO: remove, this is just for debugging for now
    const viewedCols: number = Math.min(numCols, featureNames.length);
    const columns = constructCols(
      viewedCols,
      featureNames,
      this.props.jointDataset,
      isCustomPointsView
    );
    return {
      columns,
      rows
    };
  }

  private updateSelection(): void {
    this._selection.setChangeEvents(false);
    this._selection.setItems(this.state.tableState.rows);
    if (this.props.selectedIndexes) {
      const rowIndexes = this.state.tableState.rows.map((row) => row[0]);
      this.props.selectedIndexes.forEach((selectedIndex): void => {
        const rowIndex = rowIndexes.indexOf(selectedIndex);
        if (!this._selection.isIndexSelected(rowIndex)) {
          this._selection.setIndexSelected(rowIndex, true, false);
        }
      });
    }
    this._selection.setChangeEvents(true);
  }

  private getSelectionDetails(): number[] {
    const selectedRows = this._selection.getSelection();
    const keys = selectedRows.map((row) => row[0] as number);
    return keys;
  }

  private onItemInvoked = (item: any): void => {
    this.props.setWhatIfDatapoint?.(item[0] as number);
  };

  private tabularDataFilter = (row: {
    [key: string]: string | number;
  }): boolean => {
    switch (this.props.dataView) {
      case DataViewKeys.CorrectInstances: {
        if (
          row[JointDataset.PredictedYLabel] !== row[JointDataset.TrueYLabel]
        ) {
          return true;
        }
        break;
      }
      case DataViewKeys.IncorrectInstances: {
        if (
          row[JointDataset.PredictedYLabel] === row[JointDataset.TrueYLabel]
        ) {
          return true;
        }
        break;
      }
      case DataViewKeys.SelectedInstances:
      default:
        break;
    }
    return false;
  };
}
