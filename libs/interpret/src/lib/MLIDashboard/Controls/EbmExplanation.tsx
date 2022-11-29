// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ComboBox, IComboBox, IComboBoxOption } from "@fluentui/react";
import {
  IExplanationContext,
  IMultiClassBoundedCoordinates,
  IFeatureValueExplanation,
  FluentUIStyles
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  AccessibleChart,
  IPlotlyProperty,
  IData,
  PlotlyMode
} from "@responsible-ai/mlchartlib";
import memoize from "memoize-one";
import React from "react";

export interface IEbmProps {
  explanationContext: IExplanationContext;
  theme: string;
}

export interface IEbmState {
  selectedFeature: number;
}

export class EbmExplanation extends React.PureComponent<IEbmProps, IEbmState> {
  private static buildCategoricalSeries: (
    coordinates: IMultiClassBoundedCoordinates,
    classes: string[]
  ) => IData[] = memoize(
    (coordinates: IMultiClassBoundedCoordinates): IData[] => {
      return coordinates.scores.map((scores, classIndex) => {
        return {
          error_y: {
            array:
              coordinates.upperBounds !== undefined
                ? coordinates.upperBounds[classIndex].map(
                    (upperVal, index) => upperVal - scores[index]
                  )
                : undefined,
            arrayminus: coordinates.lowerBounds
              ? coordinates.lowerBounds[classIndex].map(
                  (lowerVal, index) => scores[index] - lowerVal
                )
              : undefined,
            symmetric: false,
            type: "data"
          },
          orientation: "v",
          type: "bar",
          x: coordinates.names,
          y: scores
        } as IData;
      });
    }
  );

  private static buildContinuousSeries: (
    coordinates: IMultiClassBoundedCoordinates,
    classes: string[]
  ) => IData[] = memoize(
    (
      coordinates: IMultiClassBoundedCoordinates,
      classes: string[]
    ): IData[] => {
      return coordinates.scores
        .map((scores, classIndex) => {
          const color =
            FluentUIStyles.plotlyColorPalette[
              classIndex % FluentUIStyles.plotlyColorPalette.length
            ];
          const lowerBounds: IData = {
            line: {
              color: "transparent",
              shape: "hv"
            },
            mode: PlotlyMode.Lines,
            name: classes[classIndex],
            type: "scatter",
            x: coordinates.names,
            y: coordinates.lowerBounds?.[classIndex]
          };
          const centerlineSeries: IData = {
            fill: "tonexty",
            fillcolor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`,
            legendgroup: classes[classIndex],
            line: {
              color: `rgb(${color.r}, ${color.g}, ${color.b})`,
              shape: "hv"
            },
            mode: PlotlyMode.Lines,
            name: classes[classIndex],
            type: "scatter",
            x: coordinates.names,
            y: scores
          };
          const upperbounds: IData = {
            fill: "tonexty",
            fillcolor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`,
            legendgroup: classes[classIndex],
            line: {
              color: "transparent",
              shape: "hv"
            },
            mode: PlotlyMode.Lines,
            name: classes[classIndex],
            showlegend: false,
            type: "scatter",
            x: coordinates.names,
            y: coordinates.upperBounds?.[classIndex]
          } as any;
          return [lowerBounds, centerlineSeries, upperbounds];
        })
        .reduce((prev, curr) => prev.concat(...curr), []);
    }
  );

  private static buildPlotlyProps: (
    featureIndex: number,
    explanationContext: IExplanationContext
  ) => IPlotlyProperty = memoize(
    (
      featureIndex: number,
      explanationContext: IExplanationContext
    ): IPlotlyProperty => {
      const ebmObject =
        explanationContext.ebmExplanation as IFeatureValueExplanation;
      const boundedCoordinates = ebmObject?.featureList[featureIndex];

      const featureName =
        explanationContext.modelMetadata.featureNames[featureIndex];
      const isCategorical =
        (explanationContext.modelMetadata.featureIsCategorical &&
          explanationContext.modelMetadata.featureIsCategorical[
            featureIndex
          ]) ||
        boundedCoordinates?.names.some(
          (name: string | number) => typeof name === "string"
        );

      const feature = ebmObject.featureList[featureIndex];
      const data: IData[] = EbmExplanation.getData(
        feature,
        isCategorical,
        explanationContext
      );
      return {
        config: { displaylogo: false, displayModeBar: false, responsive: true },
        data,
        layout: {
          autosize: true,
          dragmode: false,
          font: {
            size: 10
          },
          hovermode: "closest",
          margin: {
            b: 30,
            t: 10
          },
          showlegend: false,
          xaxis: {
            automargin: true,
            title: featureName
          },
          yaxis: {
            automargin: true,
            title:
              ebmObject.displayParameters &&
              ebmObject.displayParameters.yAxisLabel
                ? ebmObject.displayParameters.yAxisLabel
                : localization.Interpret.IcePlot.predictedProbability
          }
        } as any
      };
    }
  );
  private featureOptions: IComboBoxOption[];

  public constructor(props: IEbmProps) {
    super(props);
    this.featureOptions =
      props.explanationContext.modelMetadata.featureNames.map(
        (featureName, featureIndex) => {
          return { key: featureIndex, text: featureName };
        }
      );
    this.state = {
      selectedFeature: 0
    };
  }
  private static getData(
    feature: IMultiClassBoundedCoordinates | undefined,
    isCategorical: boolean | undefined,
    explanationContext: IExplanationContext
  ): IData[] {
    if (!feature) {
      return [];
    }
    if (!isCategorical) {
      return EbmExplanation.buildContinuousSeries(
        feature,
        explanationContext.modelMetadata.classNames
      );
    }
    return EbmExplanation.buildCategoricalSeries(
      feature,
      explanationContext.modelMetadata.classNames
    );
  }

  public render(): React.ReactNode {
    const plotlyProps = EbmExplanation.buildPlotlyProps(
      this.state.selectedFeature,
      this.props.explanationContext
    );

    return (
      <div>
        <div>
          <ComboBox
            label={localization.Interpret.feature}
            selectedKey={this.state.selectedFeature}
            onChange={this.onFeatureSelect}
            options={this.featureOptions}
            ariaLabel={"feature picker"}
            useComboBoxAsMenuWidth
            styles={FluentUIStyles.smallDropdownStyle}
          />
        </div>
        <AccessibleChart plotlyProps={plotlyProps} theme={this.props.theme} />
      </div>
    );
  }

  private onFeatureSelect = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (typeof item?.key === "number") {
      this.setState({ selectedFeature: item.key });
    }
  };
}
