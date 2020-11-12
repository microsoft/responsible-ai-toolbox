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

export class TabularDataView extends React.PureComponent<
  ITabularDataViewProps
> {
  private _rows: any[];
  private _columns: IColumn[];
  private _selection: Selection;
  public constructor(props: ITabularDataViewProps) {
    super(props);
    this.state = {
      jointDataset: props.jointDataset
    };
    if (this.props.customPoints) {
      const viewedRows = this.props.customPoints.length;
      this._rows = rowsFromCustomPoints(
        this.props.jointDataset,
        this.props.customPoints,
        viewedRows
      );
    } else {
      const numRows: number = this.props.jointDataset.datasetRowCount;
      let viewedRows: number = numRows;
      if (this.props.allSelectedIndexes) {
        viewedRows = Math.min(numRows, this.props.allSelectedIndexes.length);
      }
      this._rows = constructRows(
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
    const classNames = tabularDataViewStyles();
    return (
      <div className={classNames.mainScrollBarPane}>
        <Fabric>
          <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
            <MarqueeSelection selection={this._selection}>
              <DetailsList
                items={this._rows}
                columns={this._columns}
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
                //onItemInvoked={this._onItemInvoked}
              />
            </MarqueeSelection>
          </ScrollablePane>
        </Fabric>
      </div>
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
