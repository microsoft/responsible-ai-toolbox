// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  flipComparisonType,
  ICausalPolicyTreeNode,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { TreatmentCell } from "./TreatmentCell";
import { TreatmentCondition } from "./TreatmentCondition";
import { TreatmentTableStyles } from "./TreatmentTable.styles";

export interface ITreatmentTableProps {
  data?: ICausalPolicyTreeNode;
}

interface ITreatmentTableState {
  rows: React.ReactNode[][];
}

export class TreatmentTable extends React.PureComponent<
  ITreatmentTableProps,
  ITreatmentTableState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: ITreatmentTableProps) {
    super(props);
    this.state = { rows: this.getRows() };
  }

  public componentDidUpdate(prevProp: ITreatmentTableProps): void {
    if (this.props.data !== prevProp.data) {
      this.setState({ rows: this.getRows() });
    }
  }

  public render(): React.ReactNode {
    const styles = TreatmentTableStyles();
    if (!this.props.data) {
      return <div>{localization.CausalAnalysis.TreatmentPolicy.noData}</div>;
    }
    return (
      <table className={styles.table}>
        {this.state.rows.map((r, i) => (
          <tr key={i}>{r}</tr>
        ))}
      </table>
    );
  }

  private getRows = (): React.ReactNode[][] => {
    if (!this.props.data) {
      return [];
    }
    if (this.props.data.leaf) {
      return this.getBranchRows(this.props.data, 1, 1);
    }
    const maxLevel = this.getMaxLevel(this.props.data);
    const leftMaxLevel = this.getMaxLevel(this.props.data.left);
    const leftRows = this.getBranchRows(
      this.props.data.left,
      leftMaxLevel,
      1 << (maxLevel - 1)
    );
    leftRows[0].unshift(
      <TreatmentCondition
        rowSpan={leftMaxLevel}
        key={-1}
        fieldName={this.props.data.feature}
        comparisonType={flipComparisonType(this.props.data.right_comparison)}
        comparisonValue={this.props.data.comparison_value}
      />
    );
    const rightMaxLevel = this.getMaxLevel(this.props.data.right);
    const rightRows = this.getBranchRows(
      this.props.data.right,
      rightMaxLevel,
      1 << (maxLevel - 1)
    );
    rightRows[0].unshift(
      <TreatmentCondition
        rowSpan={rightMaxLevel}
        key={-1}
        fieldName={this.props.data.feature}
        comparisonType={this.props.data.right_comparison}
        comparisonValue={this.props.data.comparison_value}
      />
    );
    return [...leftRows, ...rightRows];
  };

  private getBranchRows = (
    data: ICausalPolicyTreeNode,
    rowSpan: number,
    colSpan: number
  ): React.ReactNode[][] => {
    const res = [];
    const queue = [];
    queue.push({
      colSpan,
      data,
      rowSpan
    });
    while (queue.length) {
      const len = queue.length;
      const currentRow = [];
      for (let i = 0; i < len; i++) {
        const next = queue.shift();
        if (!next) {
          break;
        }
        if (next.data.leaf) {
          currentRow.push(
            <TreatmentCell
              data={next.data}
              key={currentRow.length}
              rowSpan={next.rowSpan}
              colSpan={next.colSpan}
            />
          );
        } else {
          currentRow.push(
            <TreatmentCondition
              colSpan={next.colSpan >> 1}
              key={currentRow.length}
              fieldName={next.data.feature}
              comparisonType={flipComparisonType(next.data.right_comparison)}
              comparisonValue={next.data.comparison_value}
            />
          );
          currentRow.push(
            <TreatmentCondition
              colSpan={next.colSpan >> 1}
              key={currentRow.length}
              fieldName={next.data.feature}
              comparisonType={next.data.right_comparison}
              comparisonValue={next.data.comparison_value}
            />
          );
          queue.push({
            colSpan: next.colSpan >> 1,
            data: next.data.left,
            rowSpan: next.rowSpan - 1
          });
          queue.push({
            colSpan: next.colSpan >> 1,
            data: next.data.right,
            rowSpan: next.rowSpan - 1
          });
        }
      }
      res.push(currentRow);
    }
    return res;
  };

  private getMaxLevel(node: ICausalPolicyTreeNode): number {
    if (node.leaf) {
      return 1;
    }
    return (
      Math.max(this.getMaxLevel(node.left), this.getMaxLevel(node.right)) + 1
    );
  }
}
