// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Highcharts from "highcharts";
import React from "react";

interface IDonutProps {
  input: any;
}
interface IDonutState {
  series: any;
}

export class Donut extends React.Component<IDonutProps, IDonutState> {
  constructor(props: IDonutProps) {
    super(props);
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

  highChartsRender() {
    Highcharts.chart({
      chart: {
        renderTo: "atmospheric-composition",
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
          fontSize: "10px"
        },
        text: "Earth's Atmospheric Composition",
        verticalAlign: "middle"
      }
    });
  }

  componentDidMount() {
    this.highChartsRender();
  }

  render() {
    return <div id="atmospheric-composition" />;
  }
}
