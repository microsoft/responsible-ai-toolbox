import React from "react";
import { HelpMessageDict } from "../Interfaces";
import { mergeStyleSets } from "office-ui-fabric-react/lib/Styling";
import {
  IPivot,
  IPivotItemProps,
  PivotItem,
  Pivot,
  PivotLinkSize
} from "office-ui-fabric-react/lib/Pivot";
// import { InstanceViewStyles } from "./TabularDataView.styles";
import { localization } from "../../Localization/localization";
import { JointDataset } from "../JointDataset";
import { max, min } from "lodash";
import {
  DetailsList,
  DetailsListLayoutMode,
  Selection,
  IColumn
} from "office-ui-fabric-react/lib/DetailsList";
import { Fabric } from "office-ui-fabric-react/lib/Fabric";
import { Announced } from "office-ui-fabric-react/lib/Announced";
import {
  TextField,
  ITextFieldStyles
} from "office-ui-fabric-react/lib/TextField";
import { MarqueeSelection } from "office-ui-fabric-react/lib/MarqueeSelection";

export interface ITabularDataViewProps {
  theme?: string;
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
  constructor(props: ITabularDataViewProps) {
    super(props);
    this.state = {
      jointDataset: props.jointDataset
    };
    const numRows = this.props.jointDataset.datasetRowCount;
    const viewedRows = min([numRows, 8]);
    this._rows = [];
    for (let i = 0; i < viewedRows; i++) {
      const row = this.props.jointDataset.getRow(i);
      let data = JointDataset.datasetSlice(
        row,
        this.props.jointDataset.metaDict,
        this.props.jointDataset.localExplanationFeatureCount
      );
      let datarow = [];
      for (let j = 0; j < data.length; j++) {
        datarow.push({
          key: j,
          name: j,
          value: data[j]
        });
      }
      this._rows.push(data);
    }
    const numCols = this.props.jointDataset.datasetFeatureCount;
    const featureNames = this.props.features;
    // TODO: remove, this is just for debugging for now
    const viewedCols = min([numCols, featureNames.length]);
    this._columns = [];
    for (let i = 0; i < viewedCols; i++) {
      this._columns.push({
        key: "column" + i,
        name: featureNames[i],
        fieldName: i.toString(),
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
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
