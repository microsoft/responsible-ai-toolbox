// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import Highcharts from "highcharts";
import { uniqueId } from "lodash";
import React from "react";

import { ICausalAnalysisSingleData } from "../Interfaces/ICausalAnalysisData";

interface IErrorBarChartProps {
  input: ICausalAnalysisSingleData[] | undefined;
  theme?: string | ITheme;
}
interface IErrorBarChartState {
  series: any;
}

export class ErrorBarChart extends React.Component<
  IErrorBarChartProps,
  IErrorBarChartState
> {
  private readonly chartId: string;
  constructor(props: IErrorBarChartProps) {
    super(props);
    this.chartId = uniqueId();
    this.state = {
      series: [
        {
          data: [
            {
              color: "#3498db",
              name: "Argon",
              y: 0.9
            },
            {
              color: "#9b59b6",
              name: "Nitrogen",
              y: 78.1
            },
            {
              color: "#2ecc71",
              name: "Oxygen",
              y: 20.9
            },
            {
              color: "#f1c40f",
              name: "Trace Gases",
              y: 0.1
            }
          ],
          name: "Gases"
        }
      ]
    };
  }

  public highChartsRender(): void {
    Highcharts.chart({
      chart: {
        renderTo: this.chartId,
        type: "pie"
      },
      plotOptions: {
        pie: {
          dataLabels: {
            format: "{point.name}: {point.percentage:.1f} %"
          },
          innerSize: "70%"
        }
      },
      series: this.state.series,
      title: {
        floating: true,
        style: {
          color: "red",
          fontSize: "10px"
        },
        text: "Earth's Atmospheric Composition",
        verticalAlign: "middle"
      }
    });
  }

  public componentDidMount() {
    this.highChartsRender();
  }

  public render(): React.ReactNode {
    return <div id={this.chartId} />;
  }
}
