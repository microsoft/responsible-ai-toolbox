// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IComboBoxOption } from "@fluentui/react";
import {
  JointDataset,
  Cohort,
  FluentUIStyles,
  IExplanationModelMetadata
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  IPlotlyProperty,
  AccessibleChart,
  IData
} from "@responsible-ai/mlchartlib";
import _ from "lodash";
import memoize from "memoize-one";
import React from "react";

import { LoadingSpinner } from "../SharedComponents/LoadingSpinner";

export interface IGlobalViolinPlotProps {
  topK: number;
  startingK: number;
  jointDataset: JointDataset;
  metadata: IExplanationModelMetadata;
  cohort: Cohort;
  sortVector: number[];
}

export interface IGlobalViolinPlotState {
  plotlyProps: IPlotlyProperty;
}

export class GlobalViolinPlot extends React.PureComponent<
  IGlobalViolinPlotProps,
  IGlobalViolinPlotState
> {
  private static buildPlotlyProps: (
    jointDataset: JointDataset,
    metadata: IExplanationModelMetadata,
    cohort: Cohort,
    sortVector: number[],
    selectedOption: IComboBoxOption
  ) => IPlotlyProperty = memoize(
    (
      _jointDataset: JointDataset,
      metadata: IExplanationModelMetadata,
      cohort: Cohort,
      sortVector: number[]
    ): IPlotlyProperty => {
      const plotlyProps = _.cloneDeep(GlobalViolinPlot.BasePlotlyProps);

      _.set(
        plotlyProps,
        "layout.xaxis.ticktext",
        sortVector.map((i) => metadata.featureNamesAbridged[i])
      );
      _.set(
        plotlyProps,
        "layout.xaxis.tickvals",
        sortVector.map((_, index) => index)
      );

      const baseData = plotlyProps.data[0];
      const dataArray: IData[] = [];
      sortVector.forEach((featureIndex, xIndex) => {
        const featureImportance = cohort.unwrap(
          JointDataset.ReducedLocalImportanceRoot + featureIndex.toString()
        );
        const data = { ...baseData };
        data.x = new Array(featureImportance.length).fill(xIndex);
        data.y = featureImportance;
        data.line = { color: FluentUIStyles.plotlyColorPalette[0] } as any;
        dataArray.push(data);
      });
      plotlyProps.data = dataArray;
      return plotlyProps;
    }
  );

  private static BasePlotlyProps: IPlotlyProperty = {
    config: {
      displaylogo: false,
      displayModeBar: false,
      responsive: true
    } as any,
    data: [
      {
        scalemode: "count",
        spanmode: "hard",
        type: "violin"
      }
    ] as any,
    layout: {
      autosize: true,
      dragmode: false,
      font: {
        size: 10
      },
      hovermode: "closest",
      margin: {
        b: 30,
        r: 210,
        t: 10
      },
      showlegend: false,
      xaxis: {
        automargin: true
      },
      yaxis: {
        automargin: true,
        title: localization.Interpret.featureImportance
      }
    } as any
  };

  public constructor(props: IGlobalViolinPlotProps) {
    super(props);

    this.state = {
      plotlyProps: undefined
    };
  }

  public componentDidUpdate(prevProps: IGlobalViolinPlotProps): void {
    if (this.props.sortVector !== prevProps.sortVector) {
      this.setState({ plotlyProps: undefined });
    }
  }

  public render(): React.ReactNode {
    if (this.state.plotlyProps === undefined) {
      const plotlyProps = GlobalViolinPlot.buildPlotlyProps(
        this.props.jointDataset,
        this.props.metadata,
        this.props.cohort,
        this.props.sortVector,
        undefined
      );
      this.setState({ plotlyProps });
      return <LoadingSpinner />;
    }
    const relayoutArg = {
      "xaxis.range": [
        this.props.startingK - 0.5,
        this.props.startingK + this.props.topK - 0.5
      ]
    };
    const plotlyProps = this.state.plotlyProps;
    _.set(plotlyProps, "layout.xaxis.range", [
      this.props.startingK - 0.5,
      this.props.startingK + this.props.topK - 0.5
    ]);
    return (
      <AccessibleChart
        plotlyProps={plotlyProps}
        theme={undefined}
        relayoutArg={relayoutArg as any}
      />
    );
  }
}
