// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JointDataset } from "@responsible-ai/interpret";
import {
  ConstrainMode,
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  IDetailsHeaderProps,
  IDetailsColumnRenderTooltipProps,
  ITheme,
  Selection,
  SelectionMode
} from "office-ui-fabric-react";
import { Fabric } from "office-ui-fabric-react/lib/Fabric";
import { MarqueeSelection } from "office-ui-fabric-react/lib/MarqueeSelection";
import {
  ScrollablePane,
  ScrollbarVisibility
} from "office-ui-fabric-react/lib/ScrollablePane";
import { Sticky, StickyPositionType } from "office-ui-fabric-react/lib/Sticky";
import { TooltipHost } from "office-ui-fabric-react/lib/Tooltip";
import { IRenderFunction } from "office-ui-fabric-react/lib/Utilities";
import React from "react";

import { ErrorCohort } from "../../ErrorCohort";
import { HelpMessageDict } from "../../Interfaces/IStringsParam";
import {
  constructRows,
  constructCols,
  rowsFromCustomPoints
} from "../../utils/DatasetUtils";

import { tabularDataViewStyles } from "./TabularDataView.styles";

export interface ITabularDataViewProps {
  theme?: ITheme;
  messages?: HelpMessageDict;
  features: string[];
  jointDataset: JointDataset;
  dataView: DataViewKeys;
  setSelectedIndexes: (indexes: number[]) => void;
  selectedIndexes: number[];
  allSelectedIndexes?: number[];
  customPoints?: Array<{ [key: string]: any }>;
  selectedCohort: ErrorCohort;
}

export interface ITableState {
  rows: any[];
  columns: IColumn[];
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
    return <div></div>;
  }
  const onRenderColumnHeaderTooltip: IRenderFunction<IDetailsColumnRenderTooltipProps> = (
    tooltipHostProps
  ) => <TooltipHost {...tooltipHostProps} />;
  return (
    <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced>
      {defaultRender!({
        ...props,
        onRenderColumnHeaderTooltip
      })}
    </Sticky>
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
      onSelectionChanged: (): void =>
        this.props.setSelectedIndexes(this.getSelectionDetails())
    });
    this.updateSelection();
  }

  public componentDidUpdate(prevProps: ITabularDataViewProps): void {
    if (
      this.props.customPoints !== prevProps.customPoints ||
      this.props.selectedCohort !== prevProps.selectedCohort
    ) {
      const newTableState = this.updateItems();
      this.setState({ tableState: newTableState });
      this.updateSelection();
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
                onRenderDetailsHeader={onRenderDetailsHeader}
                selectionPreservedOnEmptyClick={true}
                ariaLabelForSelectionColumn="Toggle selection"
                ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                checkButtonAriaLabel="Row checkbox"
                selectionMode={SelectionMode.multiple}
                selection={this._selection}
              />
            </MarqueeSelection>
          </ScrollablePane>
        </Fabric>
      </div>
    );
  }

  private updateItems(): ITableState {
    let rows = [];
    if (this.props.customPoints) {
      const viewedRows = this.props.customPoints.length;
      rows = rowsFromCustomPoints(
        this.props.jointDataset,
        this.props.customPoints,
        viewedRows
      );
    } else {
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
        this.tabularDataFilter.bind(this),
        this.props.allSelectedIndexes
      );
    }

    const numCols: number = this.props.jointDataset.datasetFeatureCount;
    const featureNames: string[] = this.props.features;
    // TODO: remove, this is just for debugging for now
    const viewedCols: number = Math.min(numCols, featureNames.length);
    const columns = constructCols(viewedCols, featureNames);
    return {
      columns,
      rows
    };
  }

  private updateSelection(): void {
    this._selection.setItems(this.state.tableState.rows);
    if (this.props.selectedIndexes) {
      const rowIndexes = this.state.tableState.rows.map((row) => row[0]);
      this.props.selectedIndexes.forEach((selectedIndex): void => {
        const rowIndex = rowIndexes.indexOf(selectedIndex);
        this._selection.setIndexSelected(rowIndex, true, true);
      });
    }
  }

  private getSelectionDetails(): number[] {
    const selectedRows = this._selection.getSelection();
    const keys = selectedRows.map((row) => row[0] as number);
    return keys;
  }

  private tabularDataFilter(row: { [key: string]: number }): boolean {
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
  }
}
