// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  BasicHighChart,
  getDistributionBalanceChartOptions,
  IDistributionBalanceMeasures
} from "@responsible-ai/core-ui";
import { getTheme, Text } from "office-ui-fabric-react";
import React from "react";

import { dataBalanceTabStyles } from "./DataBalanceTab.styles";

export interface IDistributionBalanceMeasureProps {
  distributionBalanceMeasures: IDistributionBalanceMeasures;
  datasetName?: string;
}

export class DistributionBalanceMeasureChart extends React.PureComponent<IDistributionBalanceMeasureProps> {
  public render(): React.ReactNode {
    const styles = dataBalanceTabStyles();

    return (
      <div>
        <Text variant="large" className={styles.leftLabel}>
          {
            "Distribution Balance Measures" // TODO: Replace with localization
          }
        </Text>
        <br />
        <BasicHighChart
          configOverride={getDistributionBalanceChartOptions(
            this.props.distributionBalanceMeasures,
            this.props.datasetName,
            getTheme()
          )}
        />
      </div>
    );
  }
}
