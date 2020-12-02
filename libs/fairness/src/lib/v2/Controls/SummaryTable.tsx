// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, Text } from "office-ui-fabric-react";
import React from "react";

import { SummaryTableStyles } from "./SummaryTable.styles";

export interface ISummaryTableProps {
  binLabels: string[];
  binGroup: string;
}

export class SummaryTable extends React.PureComponent<ISummaryTableProps> {
  public render(): React.ReactNode {
    const theme = getTheme();
    const styles = SummaryTableStyles();
    return (
      <div className={styles.frame}>
        <div className={styles.groupCol}>
          <div className={styles.groupLabel}>
            <Text variant={"medium"} color={theme.semanticColors.bodyText}>
              {this.props.binGroup}
            </Text>
          </div>
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
