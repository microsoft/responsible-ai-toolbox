// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  DetailsList,
  DetailsListLayoutMode,
  FontWeights,
  IColumn,
  SelectionMode,
  Text
} from "office-ui-fabric-react";
import React from "react";

export interface IOverallTableProps {
  binValues: number[];
  formattedBinValues: Array<string[] | undefined>;
  binLabels: string[];
  metricLabels: string[];
  expandAttributes: boolean;
  overallMetrics: string[];
  binGroup: string;
}

export class OverallTable extends React.PureComponent<IOverallTableProps> {
  public render(): React.ReactNode {
    let minIndexes = [];
    let maxIndexes = [];
    let minValue = Number.MAX_SAFE_INTEGER;
    let maxValue = Number.MIN_SAFE_INTEGER;
    this.props.binValues.forEach((value, index) => {
      if (value >= maxValue) {
        if (value === maxValue) {
          maxIndexes.push(index);
        } else {
          maxIndexes = [index];
          maxValue = value;
        }
      }
      if (value <= minValue) {
        if (value === minValue) {
          minIndexes.push(index);
        } else {
          minIndexes = [index];
          minValue = value;
        }
      }
    });

    const items: Array<{ key: any }> = [];
    if (
      this.props.formattedBinValues.length > 0 &&
      this.props.formattedBinValues[0]
    ) {
      // add row for overall metrics
      const item = {
        binLabel: localization.Fairness.Report.overallLabel,
        key: "binLabel"
      };
      this.props.overallMetrics.forEach((metric, colIndex) => {
        item["metric" + colIndex] = metric;
      });
      items.push(item);

      // add rows for each group
      this.props.formattedBinValues[0].forEach((_, rowIndex) => {
        const item = {
          binLabel: this.props.binLabels[rowIndex],
          key: rowIndex
        };
        this.props.formattedBinValues.forEach((metricArray, colIndex) => {
          if (metricArray) {
            item["metric" + colIndex] = metricArray[rowIndex];
          } else {
            item["metric" + colIndex] = "empty";
          }
        });
        items.push(item);
      });
    }

    const columns: IColumn[] = [
      {
        fieldName: "binLabel",
        isResizable: true,
        key: "columnBin",
        maxWidth: 100,
        minWidth: 50,
        name: "",
        onRender: this.renderBinColumn
      }
    ];
    this.props.metricLabels.forEach((colName, colIndex) => {
      columns.push({
        fieldName: "metric" + colIndex,
        isResizable: true,
        key: "column" + colIndex,
        maxWidth: 150,
        minWidth: 75,
        name: colName
      });
    });

    return (
      <DetailsList
        items={items}
        columns={columns}
        setKey="set"
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
      />
    );
  }

  private readonly renderBinColumn = (item?: any): React.ReactNode => {
    if (!item) {
      return undefined;
    }
    return (
      <Text
        styles={{
          root: {
            fontWeight: FontWeights.semibold
          }
        }}
        block
      >
        {item.binLabel}
      </Text>
    );
  };
}
