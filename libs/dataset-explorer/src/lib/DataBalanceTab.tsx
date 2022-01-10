// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  FabricStyles,
  MissingParametersPlaceholder,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { AccessibleChart, IPlotlyProperty } from "@responsible-ai/mlchartlib";
import {
  getAggregateBalanceMeasures,
  getDistributionBalanceMeasures,
  getFeatureBalanceMeasures,
  IDataBalanceMeasures
} from "libs/core-ui/src/lib/Interfaces/DataBalanceInterfaces";
import _ from "lodash";
import { getTheme, Stack, StackItem } from "office-ui-fabric-react";
import { Annotations } from "plotly.js";
import React from "react";

import { dataBalanceTabStyles } from "./DataBalanceTab.styles";

export class IDataBalanceTabProps {}

export interface IDataBalanceTabState {}

export class DataBalanceTab extends React.Component<
  IDataBalanceTabProps,
  IDataBalanceTabState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: IDataBalanceTabProps) {
    super(props);

    this.state = {};
  }

  public render(): React.ReactNode {
    const classNames = dataBalanceTabStyles();

    if (!this.context.dataset.dataBalanceMeasures) {
      return (
        <MissingParametersPlaceholder>
          {
            "This tab requires the dataset to contain already computed data balance measures." // TODO: Replace with localization
          }
        </MissingParametersPlaceholder>
      );
    }

    const plotlyProps = generatePlotlyProps(
      this.context.dataset.dataBalanceMeasures
    );

    return (
      <div className={classNames.page}>
        <h1>Aggregate Balance Measures</h1>
        <Stack>
          <StackItem>
            {`atkinsonIndex --> ${
              getAggregateBalanceMeasures(
                this.context.dataset.dataBalanceMeasures
                  ?.aggregateBalanceMeasures?.measures ?? {}
              ).atkinsonIndex
            }`}
          </StackItem>
          <StackItem>
            {`theilLIndex --> ${
              getAggregateBalanceMeasures(
                this.context.dataset.dataBalanceMeasures
                  ?.aggregateBalanceMeasures?.measures ?? {}
              ).theilLIndex
            }`}
          </StackItem>
          <StackItem>
            {`theilTIndex --> ${
              getAggregateBalanceMeasures(
                this.context.dataset.dataBalanceMeasures
                  ?.aggregateBalanceMeasures?.measures ?? {}
              ).theilTIndex
            }`}
          </StackItem>
        </Stack>
        <h1>Distribution Balance Measures</h1>
        <Stack>
          <StackItem>
            {`race wassersteinDist --> ${
              getDistributionBalanceMeasures(
                this.context.dataset.dataBalanceMeasures
                  ?.distributionBalanceMeasures?.measures ?? {},
                "race"
              ).wassersteinDist
            }`}
          </StackItem>
          <StackItem>
            {`sex jsDist --> ${
              getDistributionBalanceMeasures(
                this.context.dataset.dataBalanceMeasures
                  ?.distributionBalanceMeasures?.measures ?? {},
                "sex"
              ).jsDist
            }`}
          </StackItem>
        </Stack>
        <h1>Feature Balance Measures</h1>
        <AccessibleChart plotlyProps={plotlyProps} theme={getTheme()} />
      </div>
    );
  }
}

const basePlotlyProperties: IPlotlyProperty = {
  config: { displaylogo: false, displayModeBar: false, responsive: true },
  data: [{}],
  layout: {
    autosize: true,
    dragmode: false,
    font: {
      size: 10
    },
    hovermode: "closest",
    margin: {
      b: 20,
      l: 20,
      r: 0,
      t: 0
    },
    showlegend: false,
    xaxis: {
      color: FabricStyles.chartAxisColor,
      mirror: true,
      tickfont: {
        family: FabricStyles.fontFamilies,
        size: 11
      },
      zeroline: true
    },
    yaxis: {
      automargin: true,
      color: FabricStyles.chartAxisColor,
      gridcolor: "#e5e5e5",
      showgrid: true,
      tickfont: {
        family: "Roboto, Helvetica Neue, sans-serif",
        size: 11
      },
      zeroline: true
    }
  }
};

function generatePlotlyProps(
  dataBalanceMeasures: IDataBalanceMeasures
): IPlotlyProperty {
  const plotlyProps = _.cloneDeep(basePlotlyProperties);
  plotlyProps.data[0].type = "heatmap";
  // plotlyProps.data[0].colorscale = [
  //   [0, "#3D9970"],
  //   [1, "#001f3f"]
  // ];

  // TODO: Keep red-blue but make min/max -1 and 1

  const selectedFeature = "race";

  const features = new Map<string, string[]>();
  features.set(
    selectedFeature,
    dataBalanceMeasures.featureBalanceMeasures?.classes?.[selectedFeature] ?? []
  );

  const data: number[][] = [];
  const annotations: Array<Partial<Annotations>> = [];

  features.forEach((classes, featureName) => {
    classes.forEach((classA, colIndex) => {
      const row: number[] = [];
      classes.forEach((classB, rowIndex) => {
        const featureValue = getFeatureBalanceMeasures(
          dataBalanceMeasures.featureBalanceMeasures?.measures ?? {},
          featureName,
          classA,
          classB
        ).dp;

        row.push(featureValue);

        annotations.push({
          align: "center",
          font: {
            color: featureValue === 0 ? "black" : "white",
            family: "Arial",
            size: 12
          },
          showarrow: false,
          text: `${
            featureValue === undefined ? Number.NaN : featureValue.toFixed(3)
          }`,
          x: rowIndex,
          xref: "x",
          y: colIndex,
          yref: "y"
        });
      });

      data.push(row);
    });
  });

  const featureNames = features.get(selectedFeature);
  plotlyProps.data[0].x = featureNames;
  plotlyProps.data[0].y = featureNames;
  plotlyProps.data[0].z = data;

  (plotlyProps.layout ?? {}).annotations = annotations;

  return plotlyProps;
}
