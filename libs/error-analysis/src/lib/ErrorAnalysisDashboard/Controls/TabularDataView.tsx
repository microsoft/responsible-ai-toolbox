// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JointDataset } from "@responsible-ai/interpret";
import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  ITheme,
  Selection,
  SelectionMode
} from "office-ui-fabric-react";
import { Fabric } from "office-ui-fabric-react/lib/Fabric";
import { MarqueeSelection } from "office-ui-fabric-react/lib/MarqueeSelection";
import React from "react";

import { HelpMessageDict } from "../Interfaces/IStringsParam";
import { constructRows, constructCols } from "../utils/DatasetUtils";

export interface ITabularDataViewProps {
  theme?: ITheme;
  messages?: HelpMessageDict;
  features: string[];
  jointDataset: JointDataset;
  dataView: DataViewKeys;
  setSelectedIndexes: (indexes: number[]) => void;
  selectedIndexes: number[];
  allSelectedIndexes?: number[];
}

export interface ITabularDataViewState {
  jointDataset: JointDataset;
}

export enum DataViewKeys {
  SelectedInstances = "SelectedInstances",
  CorrectInstances = "CorrectInstances",
  IncorrectInstances = "IncorrectInstances"
}

export class TabularDataView extends React.PureComponent<
  ITabularDataViewProps,
  ITabularDataViewState
> {
  private _rows: any[];
  private _columns: IColumn[];
  private _selection: Selection;
  public constructor(props: ITabularDataViewProps) {
    super(props);
    this.state = {
      jointDataset: props.jointDataset
    };
    const numRows: number = this.props.jointDataset.datasetRowCount;
    let viewedRows: number = Math.min(numRows, 8);
    if (this.props.allSelectedIndexes) {
      viewedRows = Math.min(numRows, this.props.allSelectedIndexes.length);
    }
    this._rows = constructRows(
      this.props.jointDataset,
      viewedRows,
      this.tabularDataFilter.bind(this),
      this.props.allSelectedIndexes
    );
    const numCols: number = this.props.jointDataset.datasetFeatureCount;
    const featureNames: string[] = this.props.features;
    // TODO: remove, this is just for debugging for now
    const viewedCols: number = Math.min(numCols, featureNames.length);
    this._columns = constructCols(viewedCols, featureNames);
    this._selection = new Selection({
      onSelectionChanged: (): void =>
        this.props.setSelectedIndexes(this.getSelectionDetails())
    });
    this._selection.setItems(this._rows);
    if (this.props.selectedIndexes) {
      const rowIndexes = this._rows.map((row) => row[0]);
      this.props.selectedIndexes.forEach((selectedIndex): void => {
        const rowIndex = rowIndexes.indexOf(selectedIndex);
        this._selection.setIndexSelected(rowIndex, true, true);
      });
    }
  }

  public render(): React.ReactNode {
    return (
      <Fabric>
        <MarqueeSelection selection={this._selection}>
          <DetailsList
            items={this._rows}
            columns={this._columns}
            setKey="set"
            layoutMode={DetailsListLayoutMode.justified}
            selectionPreservedOnEmptyClick={true}
            ariaLabelForSelectionColumn="Toggle selection"
            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
            checkButtonAriaLabel="Row checkbox"
            selectionMode={SelectionMode.multiple}
            selection={this._selection}
            //onItemInvoked={this._onItemInvoked}
          />
        </MarqueeSelection>
      </Fabric>
    );
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
