// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode
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

    var items: { key: any }[] = [];
    if (
      this.props.formattedBinValues.length > 0 &&
      this.props.formattedBinValues[0]
    ) {
      // add row for overall metrics
      var item = {
        key: "binLabel",
        binLabel: localization.Fairness.Report.overallLabel
      };
      this.props.overallMetrics.forEach((metric, colIndex) => {
        item["metric" + colIndex] = metric;
      });
      items.push(item);

      // add rows for each group
      this.props.formattedBinValues[0].forEach((_, rowIndex) => {
        var item = { key: rowIndex, binLabel: this.props.binLabels[rowIndex] };
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

    var columns = [
      {
        key: "columnBin",
        name: "",
        fieldName: "binLabel",
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
      }
    ];
    this.props.metricLabels.forEach((colName, colIndex) => {
      columns.push({
        key: "column" + colIndex,
        name: colName,
        fieldName: "metric" + colIndex,
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
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
}
