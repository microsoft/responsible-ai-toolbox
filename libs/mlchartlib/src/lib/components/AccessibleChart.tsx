// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import _ from "lodash";
import Plotly from "plotly.js";
import React from "react";
import Plot from "react-plotly.js";
import { v4 } from "uuid";

import { accessibleChartStyles } from "./AccessibleChart.styles";
import { formatValue } from "./DisplayFormatters";
import { IPlotlyProperty } from "./IPlotlyProperty";
import { PlotlyThemes, IPlotlyTheme } from "./PlotlyThemes";

export interface IPlotlyAnimateProps {
  props: Partial<IPlotlyProperty>;
  animationAttributes?: any;
}

export interface IAccessibleChartProps {
  plotlyProps: IPlotlyProperty;
  theme: string | ITheme | undefined;
  themeOverride?: Partial<IPlotlyTheme>;
  relayoutArg?: Partial<Plotly.Layout>;
  localizedStrings?: any;
  onClickHandler?: (data: any) => void;
}

export class AccessibleChart extends React.Component<IAccessibleChartProps> {
  public guid: string = v4();
  private timer: number | undefined;

  public componentWillUnmount(): void {
    if (this.timer) {
      window.clearTimeout(this.timer);
    }
  }

  public render(): React.ReactNode {
    let themeOverride = this.props.themeOverride;
    if (
      !themeOverride &&
      this.props.theme &&
      typeof this.props.theme !== "string"
    ) {
      themeOverride = {
        axisColor: this.props.theme.palette.neutralPrimary,
        axisGridColor: this.props.theme.palette.neutralLight,
        backgroundColor: this.props.theme.palette.white,
        fontColor: this.props.theme.semanticColors.bodyText
      };
    }
    if (this.hasData()) {
      const themedProps = this.props.theme
        ? PlotlyThemes.applyTheme(
            this.props.plotlyProps,
            this.props.theme,
            themeOverride
          )
        : _.cloneDeep(this.props.plotlyProps);
      return (
        <>
          <Plot
            className={accessibleChartStyles.chart}
            data={themedProps.data}
            layout={
              {
                ...themedProps.layout,
                ...this.props.relayoutArg
              } as Partial<Plotly.Layout>
            }
            config={themedProps.config as Partial<Plotly.Config>}
            onClick={this.props.onClickHandler}
          />
          {this.createTableWithPlotlyData(this.props.plotlyProps.data)}
        </>
      );
    }
    return (
      <div className={accessibleChartStyles.noData}>
        {this.props.localizedStrings
          ? this.props.localizedStrings.noData
          : "No Data"}
      </div>
    );
  }

  private hasData(): boolean {
    return (
      this.props.plotlyProps &&
      this.props.plotlyProps.data.length > 0 &&
      _.some(
        this.props.plotlyProps.data,
        (datum) => !_.isEmpty(datum.y) || !_.isEmpty(datum.x)
      )
    );
  }

  private createTableWithPlotlyData(data: Plotly.Data[]): React.ReactNode {
    return (
      <table className={accessibleChartStyles.plotlyTable}>
        <tbody>
          {data.map((datum, index) => {
            const xDataLength = datum.x ? datum.x.length : 0;
            const yDataLength = datum.y ? datum.y.length : 0;
            const tableWidth = Math.max(xDataLength, yDataLength);
            // Building this table is slow, need better accessibility for large charts than an unreadable table
            if (tableWidth > 500) {
              return undefined;
            }

            const xRowCells = [];
            const yRowCells = [];
            for (let i = 0; i < tableWidth; i++) {
              // Add String() because sometimes data may be Nan
              xRowCells.push(
                <td key={`${i}.x`}>{datum.x ? formatValue(datum.x[i]) : ""}</td>
              );
              yRowCells.push(
                <td key={`${i}.y`}>{datum.y ? formatValue(datum.y[i]) : ""}</td>
              );
            }
            return [
              <tr key={`${index}.x`}>{xRowCells}</tr>,
              <tr key={`${index}.y`}>{yRowCells}</tr>
            ];
          })}
        </tbody>
      </table>
    );
  }
}
