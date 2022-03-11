// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  BasicHighChart,
  getAggregateBalanceChartOptions,
  IAggregateBalanceMeasures
} from "@responsible-ai/core-ui";
import { Text } from "office-ui-fabric-react";
import React from "react";

import { dataBalanceTabStyles } from "./DataBalanceTab.styles";

export interface IAggregateBalanceMeasureProps {
  aggregateBalanceMeasures: IAggregateBalanceMeasures;
  datasetName?: string;
}

export class AggregateBalanceMeasureChart extends React.PureComponent<IAggregateBalanceMeasureProps> {
  public render(): React.ReactNode {
    if (!this.props.aggregateBalanceMeasures.measures) {
      return;
    }

    const styles = dataBalanceTabStyles();

    return (
      <div>
        <Text variant="large" className={styles.leftLabel}>
          {
            "Aggregate Balance Measures" // TODO: Replace with localization
          }
        </Text>

        <br />

        <BasicHighChart
          id="aggregateBalanceMeasureChart"
          configOverride={getAggregateBalanceChartOptions(
            this.props.aggregateBalanceMeasures,
            this.props.datasetName
          )}
          modules={["data", "export-data"]}
        />
      </div>
    );
  }
}
