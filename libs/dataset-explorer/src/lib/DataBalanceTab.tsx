// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/*eslint max-lines: ["error", {"max": 500}]*/

import {
  defaultModelAssessmentContext,
  FabricStyles,
  MissingParametersPlaceholder,
  ModelAssessmentContext,
  featureBalanceMeasureMap,
  getFeatureBalanceMeasures,
  getDistributionBalanceMeasures,
  IFeatureBalanceMeasures,
  IDistributionBalanceMeasures
} from "@responsible-ai/core-ui";
import {
  AccessibleChart,
  IData,
  IPlotlyProperty
} from "@responsible-ai/mlchartlib";
import _ from "lodash";
import {
  Dropdown,
  getTheme,
  IDropdownOption,
  Text
} from "office-ui-fabric-react";
import { Annotations, Layout } from "plotly.js";
import React from "react";

import { dataBalanceTabStyles } from "./DataBalanceTab.styles";

export class IDataBalanceTabProps {}

export interface IDataBalanceTabState {
  selectedFeatureIndex: number;
  selectedMeasureIndex: number;
}

export class DataBalanceTab extends React.Component<
  IDataBalanceTabProps,
  IDataBalanceTabState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: IDataBalanceTabProps) {
    super(props);

    this.state = {
      selectedFeatureIndex: 0,
      selectedMeasureIndex: 0
    };
  }

  public componentDidUpdate(
    _preProp: IDataBalanceTabProps,
    preState: IDataBalanceTabState
  ): void {
    const featuresLength =
      this.context.dataset.data_balance_measures?.featureBalanceMeasures
        ?.features.length;
    if (
      featuresLength !== undefined &&
      preState.selectedFeatureIndex >= featuresLength
    ) {
      this.setState({ selectedFeatureIndex: 0 });
    }

    if (preState.selectedMeasureIndex >= featureBalanceMeasureMap.size) {
      this.setState({ selectedMeasureIndex: 0 });
    }
  }

  public render(): React.ReactNode {
    const classNames = dataBalanceTabStyles();

    if (!this.context.dataset.data_balance_measures) {
      return (
        <MissingParametersPlaceholder>
          {
            "This tab requires the dataset to contain already computed data balance measures." // TODO: Replace with localization
          }
        </MissingParametersPlaceholder>
      );
    }

    // If some types of measures are available but others are not (i.e. feature balance measures are not available but distribution balance measures are),
    // we still display the measures that are available.
    const dataBalanceMeasures = this.context.dataset.data_balance_measures;

    const featureBalanceMeasures = dataBalanceMeasures.featureBalanceMeasures;
    let heatmapPlotlyProps,
      featureOptions,
      measureOptions = undefined;
    if (
      featureBalanceMeasures &&
      featureBalanceMeasures.measures &&
      featureBalanceMeasures.features &&
      featureBalanceMeasures.featureValues
    ) {
      const selectedFeatureIndex =
        this.state.selectedFeatureIndex >=
        featureBalanceMeasures.features.length
          ? 0
          : this.state.selectedFeatureIndex;
      const selectedMeasureIndex =
        this.state.selectedMeasureIndex >= featureBalanceMeasureMap.size
          ? 0
          : this.state.selectedMeasureIndex;

      featureOptions = featureBalanceMeasures.features.map(
        (feature, index) => ({ key: index, text: feature } as IDropdownOption)
      );
      measureOptions = [...featureBalanceMeasureMap].map(
        ([name, _], index) => ({ key: index, text: name } as IDropdownOption)
      );

      // TODO: See if this spread syntax works with indexed type: [...featureBalanceMeasures.featureValues].map()
      // [...featureBalanceMeasures.featureValues]
      heatmapPlotlyProps = generateHeatmapPlotlyProps(
        featureBalanceMeasures,
        featureOptions[selectedFeatureIndex].text,
        measureOptions[selectedMeasureIndex].text,
        this.context.dataset.name
      );
    }

    const distributionBalanceMeasures =
      dataBalanceMeasures.distributionBalanceMeasures;
    let barPlotlyProps = undefined;
    if (
      distributionBalanceMeasures &&
      distributionBalanceMeasures.measures &&
      distributionBalanceMeasures.features
    ) {
      barPlotlyProps = generateBarPlotlyProps(
        distributionBalanceMeasures,
        this.context.dataset.name
      );

      // TODO: This doesn't work with data_balance_measures={}
      if (!heatmapPlotlyProps && !barPlotlyProps) {
        return (
          <MissingParametersPlaceholder>
            {
              "You tried to specify data balance measures, but we were unable to visualize them. Please ensure the format is correct." // TODO: Replace with localization
            }
          </MissingParametersPlaceholder>
        );
      }
    }

    return (
      <div className={classNames.page}>
        {heatmapPlotlyProps && featureOptions && measureOptions && (
          <div>
            <Text variant="large" className={classNames.leftLabel}>
              {
                "Feature Balance Measures" // TODO: Replace with localization
              }
            </Text>
            <div className={classNames.featureAndMeasurePickerWrapper}>
              <Text
                variant="mediumPlus"
                className={classNames.featureAndMeasurePickerLabel}
              >
                {
                  "Select a dataset feature and measure to explore" // TODO: Replace with localization
                }
              </Text>
              <Dropdown
                styles={{
                  callout: {
                    selectors: {
                      ".ms-Button-flexContainer": {
                        width: "100%"
                      }
                    }
                  },
                  dropdown: {
                    width: 150
                  }
                }}
                id="dataBalanceFeatureDropdown"
                options={featureOptions}
                selectedKey={this.state.selectedFeatureIndex}
                onChange={this.setSelectedFeature}
              />
              <Dropdown
                styles={{
                  callout: {
                    selectors: {
                      ".ms-Button-flexContainer": {
                        width: "100%"
                      }
                    }
                  },
                  dropdown: {
                    width: 250
                  }
                }}
                id="dataBalanceMeasureDropdown"
                options={measureOptions}
                selectedKey={this.state.selectedMeasureIndex}
                onChange={this.setSelectedMeasure}
              />
            </div>
            <br />
            <AccessibleChart
              plotlyProps={heatmapPlotlyProps}
              theme={getTheme()}
            />
            <br />
          </div>
        )}

        <br />

        {barPlotlyProps && (
          <div>
            <Text variant="large" className={classNames.leftLabel}>
              {
                "Distribution Balance Measures" // TODO: Replace with localization
              }
            </Text>
            <br />
            <AccessibleChart plotlyProps={barPlotlyProps} theme={getTheme()} />
          </div>
        )}
      </div>
    );
  }

  private setSelectedFeature = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item?.key !== undefined) {
      this.setState({ selectedFeatureIndex: item.key as number });
    }
  };

  private setSelectedMeasure = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item?.key !== undefined) {
      this.setState({ selectedMeasureIndex: item.key as number });
    }
  };
}

const baseHeatmapPlotlyProperties: IPlotlyProperty = {
  config: { displaylogo: false, displayModeBar: false, responsive: true },
  data: [
    {
      colorscale: "Viridis", // Viridis is a colorblind-friendly color scale according to https://sjmgarnier.github.io/viridis/index.html
      type: "heatmap"
    }
  ],
  layout: {
    autosize: true,
    dragmode: false,
    font: {
      size: 10
    },
    hovermode: "closest",
    margin: {
      b: 50,
      t: 50
    },
    showlegend: false,
    title: {
      font: { size: 16 },
      pad: { b: 10, t: 10 },
      xanchor: "center",
      yanchor: "top"
    },
    xaxis: {
      color: FabricStyles.chartAxisColor,
      mirror: true,
      tickfont: {
        family: FabricStyles.fontFamilies,
        size: 11
      },
      title: "Class B",
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
      title: "Class A",
      zeroline: true
    }
  }
};

function generateHeatmapPlotlyProps(
  featureBalanceMeasures: IFeatureBalanceMeasures,
  selectedFeature: string,
  selectedMeasure: string,
  datasetName?: string
): IPlotlyProperty {
  const plotlyProps = _.cloneDeep(baseHeatmapPlotlyProperties);

  const measure = featureBalanceMeasureMap.get(selectedMeasure);
  if (!measure) {
    return plotlyProps;
  }

  const ranges = measure.range;
  if (ranges) {
    plotlyProps.data[0] = {
      ...plotlyProps.data[0],
      ...({ zmax: ranges[1], zmin: ranges[0] } as IData)
    };
  }

  const features = new Map<string, string[]>([
    [selectedFeature, featureBalanceMeasures.featureValues[selectedFeature]]
  ]);

  const featureNames = features.get(selectedFeature);
  plotlyProps.data[0].x = featureNames;
  plotlyProps.data[0].y = featureNames;

  const layout = plotlyProps.layout as Partial<Layout>;

  const title = layout.title as Partial<{ text: string }>;
  title.text = `${selectedMeasure} of ${selectedFeature}`;

  if (datasetName) {
    title.text += ` in ${datasetName}`;
  }

  // TODO: Make colorscale/zmin/zmax work with default colors and a min/max of -1/1

  // TODO: Need to fix "stretchy" visualization after going from half browser size to full browser size

  const data: number[][] = [];
  const annotations: Array<Partial<Annotations>> = [];

  features.forEach((classes, featureName) => {
    classes.forEach((classA, colIndex) => {
      const row: number[] = [];
      classes.forEach((classB, rowIndex) => {
        // TODO: Need to figure out which measures are ok to use for heatmap
        const featureValue = getFeatureBalanceMeasures(
          featureBalanceMeasures.measures,
          featureName,
          classA,
          classB
        )[measure.varName];

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

  plotlyProps.data[0].z = data;
  layout.annotations = annotations;

  return plotlyProps;
}

const baseBarPlotlyProperties: IPlotlyProperty = {
  config: { displaylogo: false, displayModeBar: false, responsive: true },
  data: [],
  layout: {
    autosize: true,
    dragmode: false,
    font: {
      size: 10
    },
    hovermode: "closest",
    margin: {
      b: 50,
      t: 50
    },
    showlegend: true,
    title: {
      font: { size: 16 },
      pad: { b: 10, t: 10 },
      xanchor: "center",
      yanchor: "top"
    },
    xaxis: {
      color: FabricStyles.chartAxisColor,
      mirror: true,
      tickfont: {
        family: FabricStyles.fontFamilies,
        size: 11
      },
      title: "Distribution Measure",
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
      title: "Measure Value",
      zeroline: true
    }
  }
};

function generateBarPlotlyProps(
  distributionBalanceMeasures: IDistributionBalanceMeasures,
  datasetName?: string
): IPlotlyProperty {
  const plotlyProps = _.cloneDeep(baseBarPlotlyProperties);

  const features = distributionBalanceMeasures.features;

  const layout = plotlyProps.layout as Partial<Layout>;

  const title = layout.title as Partial<{ text: string }>;
  title.text = `Comparison of ${features.join(", ")} with Uniform Distribution`;

  if (datasetName) {
    title.text += ` in ${datasetName}`;
  }

  features.forEach((featureName: string) => {
    const distMeasures = getDistributionBalanceMeasures(
      distributionBalanceMeasures.measures,
      featureName
    );

    plotlyProps.data.push({
      name: featureName,
      type: "bar",
      x: Object.keys(distMeasures),
      y: Object.values(distMeasures)
    });
  });

  return plotlyProps;
}
