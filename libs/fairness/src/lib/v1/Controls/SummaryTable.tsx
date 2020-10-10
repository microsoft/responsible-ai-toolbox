// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { SummaryTableStyles } from "./SummaryTable.styles";

export interface ISummaryTableProps {
  binValues: number[] | undefined;
  formattedBinValues: string[];
  binLabels: string[];
  metricLabel: string;
  binGroup: string;
}

export class SummaryTable extends React.PureComponent<ISummaryTableProps> {
  public render(): React.ReactNode {
    const styles = SummaryTableStyles();
    let minIndexes: number[] = [];
    let maxIndexes: number[] = [];
    let minValue = Number.MAX_SAFE_INTEGER;
    let maxValue = Number.MIN_SAFE_INTEGER;
    this.props.binValues?.forEach((value, index) => {
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
                  <Stack horizontal>
                    {minIndexes.includes(index) && (
                      <Text variant={"xSmall"} className={styles.minMaxLabel}>
                        {localization.Fairness.Report.minTag}
                      </Text>
                    )}
                    {maxIndexes.includes(index) && (
                      <Text variant={"xSmall"} className={styles.minMaxLabel}>
                        {localization.Fairness.Report.maxTag}
                      </Text>
                    )}
                  </Stack>
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.metricCol}>
          <Text variant={"small"} className={styles.metricLabel}>
            {this.props.metricLabel}
          </Text>
          <div className={styles.flexCol}>
            {this.props.formattedBinValues.map((value, index) => {
              return (
                <Text
                  variant={"xLargePlus"}
                  className={styles.metricBox}
                  key={index}
                >
                  {value !== undefined ? value : "empty"}
                </Text>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
