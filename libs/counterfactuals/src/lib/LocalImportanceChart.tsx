// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICounterfactualData,
  MissingParametersPlaceholder,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  AccessibleChart,
  IData,
  IPlotlyProperty,
  PlotlyThemes
} from "@responsible-ai/mlchartlib";
import { getTheme, Stack, Text } from "office-ui-fabric-react";
import React from "react";

export interface ILocalImportanceChartProps {
  rowNumber?: number;
  currentClass: string;
  data: ICounterfactualData;
  theme?: string;
}

export interface ILocalImportanceData {
  label: string;
  value: number;
}

export class LocalImportanceChart extends React.PureComponent<
  ILocalImportanceChartProps
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  public render(): React.ReactNode {
    if (this.props.rowNumber === undefined) {
      return (
        <MissingParametersPlaceholder>
          {localization.Counterfactuals.localImportanceSelectData}
        </MissingParametersPlaceholder>
      );
    }
    const plotlyProps = this.buildPlotlyProps();
    const themedProps = this.props.theme
      ? PlotlyThemes.applyTheme(plotlyProps, this.props.theme)
      : plotlyProps;
    return (
      <Stack horizontal={false} grow tokens={{ padding: "16px 24px" }}>
        <Stack.Item>
          <Text variant={"medium"}>
            {localization.formatString(
              localization.Counterfactuals.localImportanceDescription,
              this.props.rowNumber,
              this.props.currentClass
            )}
          </Text>
        </Stack.Item>
        <Stack.Item>
          <AccessibleChart
            plotlyProps={{
              config: themedProps.config,
              data: themedProps.data,
              layout: themedProps.layout
            }}
            theme={getTheme()}
          />
        </Stack.Item>
      </Stack>
    );
  }
  private buildPlotlyProps(): IPlotlyProperty {
    const sortedData = this.getSortedData();
    const plotlyProps: IPlotlyProperty = {
      config: {
        displaylogo: false,
        displayModeBar: false,
        responsive: true
      },
      data: [],
      layout: {
        autosize: true,
        dragmode: false,
        font: {
          size: 10
        },
        hovermode: "closest",
        xaxis: {
          automargin: true
        },
        yaxis: {
          automargin: true
        }
      }
    };
    const trace = {
      type: "bar",
      x: sortedData.map((d) => d.label),
      y: sortedData.map((d) => d.value)
    } as IData;
    plotlyProps.data = [trace];
    return plotlyProps;
  }
  private getSortedData(): ILocalImportanceData[] {
    const data: ILocalImportanceData[] = [];
    if (this.props.rowNumber === undefined) {
      return data;
    }
    const localImportanceData = this.props.data?.local_importance?.[
      this.props.rowNumber
    ];
    if (!localImportanceData) {
      return data;
    }
    this.props.data.feature_names.forEach((f, index) => {
      data.push({
        label: f,
        value: localImportanceData[index] || -Infinity
      });
    });
    data.sort((d1, d2) => d2.value - d1.value);
    return data;
  }
}
