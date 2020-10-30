// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  ITheme
} from "office-ui-fabric-react";
import { Fabric } from "office-ui-fabric-react/lib/Fabric";
import React from "react";

import { HelpMessageDict } from "../Interfaces/IStringsParam";
import { JointDataset } from "@responsible-ai/interpret";

export interface ITabularDataViewProps {
  theme?: ITheme;
  messages?: HelpMessageDict;
  features: string[];
  jointDataset: JointDataset;
}

export interface ITabularDataViewState {
  jointDataset: JointDataset;
}

export class TabularDataView extends React.PureComponent<
  ITabularDataViewProps,
  ITabularDataViewState
> {
  private _rows: any[];
  private _columns: IColumn[];
  public constructor(props: ITabularDataViewProps) {
    super(props);
    this.state = {
      jointDataset: props.jointDataset
    };
    const numRows: number = this.props.jointDataset.datasetRowCount;
    const viewedRows: number = Math.min(numRows, 8);
    this._rows = [];
    for (let i = 0; i < viewedRows; i++) {
      const row = this.props.jointDataset.getRow(i);
      const data = JointDataset.datasetSlice(
        row,
        this.props.jointDataset.metaDict,
        this.props.jointDataset.localExplanationFeatureCount
      );
      const datarow = [];
      for (const [j, datum] of data.entries()) {
        datarow.push({
          key: j,
          name: j,
          value: datum
        });
      }
      this._rows.push(data);
    }
    const numCols: number = this.props.jointDataset.datasetFeatureCount;
    const featureNames: string[] = this.props.features;
    // TODO: remove, this is just for debugging for now
    const viewedCols: number = Math.min(numCols, featureNames.length);
    this._columns = [];
    for (let i = 0; i < viewedCols; i++) {
      this._columns.push({
        fieldName: i.toString(),
        isResizable: true,
        key: "column" + i,
        maxWidth: 200,
        minWidth: 100,
        name: featureNames[i]
      });
    }
  }

  public render(): React.ReactNode {
    return (
      <Fabric>
        <DetailsList
          items={this._rows}
          columns={this._columns}
          setKey="set"
          layoutMode={DetailsListLayoutMode.justified}
          selectionPreservedOnEmptyClick={true}
          ariaLabelForSelectionColumn="Toggle selection"
          ariaLabelForSelectAllCheckbox="Toggle selection for all items"
          checkButtonAriaLabel="Row checkbox"
          //onItemInvoked={this._onItemInvoked}
        />
      </Fabric>
    );
  }
}
