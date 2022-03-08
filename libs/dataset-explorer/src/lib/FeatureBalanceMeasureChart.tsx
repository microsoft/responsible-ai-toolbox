// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  BasicHighChart,
  getFeatureBalanceChartOptions,
  IFeatureBalanceMeasures
} from "@responsible-ai/core-ui";
import { getTheme } from "office-ui-fabric-react";
import React from "react";

export interface IFeatureBalanceMeasureProps {
  featureBalanceMeasures: IFeatureBalanceMeasures;
}

export class FeatureBalanceMeasureChart extends React.PureComponent<IFeatureBalanceMeasureProps> {
  public render(): React.ReactNode {
    // const styles = dataBalanceTabStyles();
    return (
      <div>
        <BasicHighChart
          configOverride={getFeatureBalanceChartOptions(
            this.props.featureBalanceMeasures,
            "dp",
            "race",
            getTheme()
          )}
        />
      </div>
    );
  }
}
