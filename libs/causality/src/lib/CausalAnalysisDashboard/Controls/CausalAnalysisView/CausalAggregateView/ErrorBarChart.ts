// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";

export interface IErrorBarChartProps {
  data: any[];
}

export class ErrorBarChart extends React.PureComponent<IErrorBarChartProps> {
  public render(): React.ReactNode {
    const options = {
      chart: {
        type: "spline"
      },
      title: {
        text: "My chart"
      },
      series: [
        {
          data: [1, 2, 1, 4, 3, 6]
        }
      ]
    };
    return <HighchartsReact highcharts={}  }
}
