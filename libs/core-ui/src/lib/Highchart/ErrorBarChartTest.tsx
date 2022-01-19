// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { uniqueId } from "lodash";
import React from "react";

import { HighChartWrapper } from "./HighchartWrapper";
import { IHighchartsOptions } from "./IHighchartOptions";

interface IErrorBarChartTestProps {
  highchartsOptions: IHighchartsOptions;
}
interface IErrorBarChartTestState {
  series: any;
}

export class ErrorBarChartTest extends React.Component<
  IErrorBarChartTestProps,
  IErrorBarChartTestState
> {
  constructor(props: IErrorBarChartTestProps) {
    super(props);
    this.chartId = uniqueId();
  }

  public render(): React.ReactNode {
    return (
      <HighChartWrapper
        className={className}
        chartOptions={{}}
        fallback={fallback}
        theme={theme}
      />
    );
  }
}
