// Copyright (c) Microsoft Corporation
// Licensed under the MIT License

import {
  BasicHighChart,
  getDistributionBalanceChartOptions,
  getFeatureBalanceChartOptions,
  IDataBalanceMeasures
} from "@responsible-ai/core-ui";
import { getTheme } from "office-ui-fabric-react";
import React from "react";
// import { dataBalanceTabStyles } from "./DataBalanceTab.styles";

export interface IDataBalanceHighChartProps {
  dataBalanceMeasures: IDataBalanceMeasures;
}

export class DataBalanceHighChart extends React.PureComponent<IDataBalanceHighChartProps> {
  public render(): React.ReactNode {
    // const styles = dataBalanceTabStyles();
    return (
      <div>
        <BasicHighChart
          configOverride={getDistributionBalanceChartOptions(
            this.props.dataBalanceMeasures,
            getTheme()
          )}
        />
        <br />
        <BasicHighChart
          configOverride={getFeatureBalanceChartOptions(
            this.props.dataBalanceMeasures,
            "dp",
            "race",
            getTheme()
          )}
        />
      </div>
    );
  }
}
