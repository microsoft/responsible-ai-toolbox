import React from "react";
import * as memoize from "memoize-one";
import {
  IPlotlyProperty,
  PlotlyMode,
  AccessibleChart
} from "@responsible-ai/mlchartlib";
import _ from "lodash";
import { IComboBoxOption } from "office-ui-fabric-react";
import { IExplanationModelMetadata, ModelTypes } from "../IExplanationContext";
import { JointDataset } from "../JointDataset";
import { localization } from "../../Localization/localization";
import { PlotlyUtils, LoadingSpinner } from "../SharedComponents";
import { Cohort } from "../Cohort";

export interface ISwarmFeaturePlotProps {
  topK: number;
  startingK: number;
  // selectionContext: SelectionContext;
  theme?: string;
  // messages?: HelpMessageDict;
  jointDataset: JointDataset;
  metadata: IExplanationModelMetadata;
  cohort: Cohort;
  sortVector: number[];
}

export interface ISwarmFeaturePlotState {
  plotlyProps: IPlotlyProperty;
}

export class SwarmFeaturePlot extends React.PureComponent<
  ISwarmFeaturePlotProps,
  ISwarmFeaturePlotState
> {
  private static buildPlotlyProps: (
    jointDataset: JointDataset,
    metadata: IExplanationModelMetadata,
    cohort: Cohort,
    sortVector: number[],
    selectedOption: IComboBoxOption
  ) => IPlotlyProperty = (memoize as any).default(
    (
      _jointDataset: JointDataset,
      metadata: IExplanationModelMetadata,
      cohort: Cohort,
      sortVector: number[],
      selectedOption: IComboBoxOption
    ): IPlotlyProperty => {
      const plotlyProps = _.cloneDeep(SwarmFeaturePlot.BasePlotlyProps);
      const ditherVector = cohort.unwrap(JointDataset.DitherLabel);
      const numRows = ditherVector.length;
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
      if (metadata.modelType === ModelTypes.binary) {
        _.set(
          plotlyProps,
          "layout.yaxis.title",
          `${localization.featureImportance}<br> ${localization.ExplanationScatter.class} ${metadata.classNames[0]}`
        );
      }
      if (selectedOption === undefined || selectedOption.key === "none") {
        PlotlyUtils.clearColorProperties(plotlyProps);
      } else {
        PlotlyUtils.setColorProperty(
          plotlyProps,
          selectedOption,
          metadata,
          selectedOption.text
        );
        if (selectedOption.data.isNormalized) {
          plotlyProps.data[0].marker.colorscale = [
            [0, "rgba(0,0,255,0.5)"],
            [1, "rgba(255,0,0,0.5)"]
          ];
          _.set(plotlyProps.data[0], "marker.colorbar.tickvals", [0, 1]);
          _.set(plotlyProps.data[0], "marker.colorbar.ticktext", [
            localization.AggregateImportance.low,
            localization.AggregateImportance.high
          ]);
        } else {
          _.set(plotlyProps.data[0], "marker.opacity", 0.6);
        }
      }
      const x = [];
      const y = [];
      sortVector.forEach((featureIndex, xIndex) => {
        x.push(
          ...new Array(numRows).fill(xIndex).map((val, i) => {
            return val + ditherVector[i];
          })
        );
        y.push(
          ...cohort.unwrap(
            JointDataset.ReducedLocalImportanceRoot + featureIndex.toString()
          )
        );
      });
      plotlyProps.data[0].x = x;
      plotlyProps.data[0].y = y;
      return plotlyProps;
    },
    // eslint-disable-next-line @typescript-eslint/unbound-method
    _.isEqual
  );

  private static BasePlotlyProps: IPlotlyProperty = {
    config: {
      displaylogo: false,
      responsive: true,
      displayModeBar: false
    } as any,
    data: [
      {
        hoverinfo: "text",
        mode: PlotlyMode.markers,
        type: "scattergl"
      }
    ] as any,
    layout: {
      dragmode: false,
      autosize: true,
      font: {
        size: 10
      },
      hovermode: "closest",
      margin: {
        t: 10,
        b: 30,
        r: 210
      },
      showlegend: false,
      yaxis: {
        automargin: true,
        title: localization.featureImportance
      },
      xaxis: {
        automargin: true
      }
    } as any
  };

  public constructor(props: ISwarmFeaturePlotProps) {
    super(props);

    this.state = {
      plotlyProps: undefined
    };
  }

  public componentDidUpdate(prevProps: ISwarmFeaturePlotProps): void {
    if (this.props.sortVector !== prevProps.sortVector) {
      this.setState({ plotlyProps: undefined });
    }
  }

  public render(): React.ReactNode {
    if (this.state.plotlyProps === undefined) {
      const plotlyProps = SwarmFeaturePlot.buildPlotlyProps(
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
        theme={this.props.theme}
        relayoutArg={relayoutArg as any}
      />
    );
  }
}
