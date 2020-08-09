import { Stack, Text } from "office-ui-fabric-react";

import React from "react";
import { localization } from "../Localization/localization";
import { SummaryTableStyles } from "./SummaryTable.styles";

export interface ISummaryTableProps {
  binValues: number[];
  formattedBinValues: string[];
  binLabels: string[];
  metricLabel: string;
  binGroup: string;
}

export class SummaryTable extends React.PureComponent<ISummaryTableProps> {
  public render(): React.ReactNode {
    const styles = SummaryTableStyles();
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
    return (
      <div className={styles.frame}>
        <div className={styles.groupCol}>
          <Text variant={"small"} className={styles.groupLabel}>
            {this.props.binGroup}
          </Text>
          <div className={styles.flexCol}>
            {this.props.binLabels.map((label, index) => {
              return (
                <div className={styles.binBox} key={index}>
                  <Text className={styles.binTitle}>{label}</Text>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
