import React from "react";
import memoize from "memoize-one";
import _ from "lodash";
import { ComboBox, IComboBox, IComboBoxOption } from "office-ui-fabric-react";
import {
  AccessibleChart,
  IPlotlyProperty,
  IData,
  PlotlyMode
} from "@responsible-ai/mlchartlib";
import {
  IExplanationContext,
  IMultiClassBoundedCoordinates,
  IFeatureValueExplanation
} from "../IExplanationContext";
import { localization } from "../../Localization/localization";
import { FabricStyles } from "../FabricStyles";

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
          orientation: "v",
          type: "bar",
          x: coordinates.names,
          y: scores,
          error_y: {
            type: "data",
            symmetric: false,
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
              : undefined
          }
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
            FabricStyles.plotlyColorPalette[
              classIndex % FabricStyles.plotlyColorPalette.length
            ];
          const lowerBounds: IData = {
            mode: PlotlyMode.Lines,
            type: "scatter",
            line: {
              shape: "hv",
              color: "transparent"
            },
            name: classes[classIndex],
            x: coordinates.names,
            y: coordinates.lowerBounds?.[classIndex]
          };
          const centerlineSeries: IData = {
            mode: PlotlyMode.Lines,
            type: "scatter",
            fill: "tonexty",
            fillcolor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`,
            line: {
              shape: "hv",
              color: `rgb(${color.r}, ${color.g}, ${color.b})`
            },
            name: classes[classIndex],
            legendgroup: classes[classIndex],
            x: coordinates.names,
            y: scores
          };
          const upperbounds: IData = {
            mode: PlotlyMode.Lines,
            type: "scatter",
            fill: "tonexty",
            fillcolor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`,
            line: {
              shape: "hv",
              color: "transparent"
            },
            name: classes[classIndex],
            legendgroup: classes[classIndex],
            showlegend: false,
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
      const ebmObject = explanationContext.ebmExplanation as IFeatureValueExplanation;
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
        config: { displaylogo: false, responsive: true, displayModeBar: false },
        data,
        layout: {
          dragmode: false,
          autosize: true,
          font: {
            size: 10
          },
          margin: {
            t: 10,
            b: 30
          },
          hovermode: "closest",
          showlegend: false,
          yaxis: {
            automargin: true,
            title:
              ebmObject.displayParameters &&
              ebmObject.displayParameters.yAxisLabel
                ? ebmObject.displayParameters.yAxisLabel
                : localization.IcePlot.predictedProbability
          },
          xaxis: {
            title: featureName,
            automargin: true
          }
        } as any
      };
    },
    _.isEqual.bind(window)
  );
  private featureOptions: IComboBoxOption[];

  public constructor(props: IEbmProps) {
    super(props);
    this.featureOptions = props.explanationContext.modelMetadata.featureNames.map(
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
            label={localization.feature}
            selectedKey={this.state.selectedFeature}
            onChange={this.onFeatureSelect}
            options={this.featureOptions}
            ariaLabel={"feature picker"}
            useComboBoxAsMenuWidth={true}
            styles={FabricStyles.smallDropdownStyle}
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
