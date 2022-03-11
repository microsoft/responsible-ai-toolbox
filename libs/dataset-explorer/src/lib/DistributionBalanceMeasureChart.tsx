// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  BasicHighChart,
  getDistributionBalanceChartOptions,
  IDistributionBalanceMeasures
} from "@responsible-ai/core-ui";
import { Text } from "office-ui-fabric-react";
import React from "react";

import { dataBalanceTabStyles } from "./DataBalanceTab.styles";

export interface IDistributionBalanceMeasureProps {
  distributionBalanceMeasures: IDistributionBalanceMeasures;
  datasetName?: string;
}

export class DistributionBalanceMeasureChart extends React.PureComponent<IDistributionBalanceMeasureProps> {
  public render(): React.ReactNode {
    if (
      !this.props.distributionBalanceMeasures.features ||
      !this.props.distributionBalanceMeasures.measures
    ) {
      return;
    }

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
          id="distributionBalanceMeasureChart"
          configOverride={getDistributionBalanceChartOptions(
            this.props.distributionBalanceMeasures,
            this.props.datasetName
          )}
        />
      </div>
    );
  }
}
