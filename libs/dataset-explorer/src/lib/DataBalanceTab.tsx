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
  featureBalanceMeasureNames,
  getFeatureBalanceMeasures,
  IDataBalanceMeasures
} from "libs/core-ui/src/lib/Interfaces/DataBalanceInterfaces";
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
  selectedCohortIndex: number;
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
      selectedCohortIndex: 0,
      selectedMeasureIndex: 0
    };
  }

  public componentDidUpdate(
    _preProp: IDataBalanceTabProps,
    preState: IDataBalanceTabState
  ): void {
    const featuresLength =
      this.context.dataset.dataBalanceMeasures?.featureBalanceMeasures.features
        .length;
    if (
      featuresLength !== undefined &&
      preState.selectedCohortIndex >= featuresLength
    ) {
      this.setState({ selectedCohortIndex: 0 });
    }

    if (preState.selectedMeasureIndex >= featureBalanceMeasureNames.size) {
      this.setState({ selectedMeasureIndex: 0 });
    }
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

    const featureBalanceMeasures =
      this.context.dataset.dataBalanceMeasures.featureBalanceMeasures;

    const selectedCohortIndex =
      this.state.selectedCohortIndex >= featureBalanceMeasures.features.length
        ? 0
        : this.state.selectedCohortIndex;

    const selectedMeasureIndex =
      this.state.selectedMeasureIndex >= featureBalanceMeasureNames.size
        ? 0
        : this.state.selectedMeasureIndex;

    const cohortOptions = featureBalanceMeasures.features.map(
      (cohort, index) => ({ key: index, text: cohort } as IDropdownOption)
    );

    const measureOptions = [...featureBalanceMeasureNames].map(
      ([name, _], index) => ({ key: index, text: name } as IDropdownOption)
    );

    // TODO: See if this spread syntax works with indexed type: [...featureBalanceMeasures.featureValues].map()

    const plotlyProps = generatePlotlyProps(
      this.context.dataset.dataBalanceMeasures,
      this.context.dataset.name,
      featureBalanceMeasures.features[selectedCohortIndex],
      [...featureBalanceMeasureNames][selectedMeasureIndex]
    );

    return (
      <div className={classNames.page}>
        <Text variant="large" className={classNames.leftLabel}>
          {
            "Feature Balance Measures" // TODO: Replace with localization
          }
        </Text>
        <br />
        <div className={classNames.cohortPickerWrapper}>
          <Text variant="mediumPlus" className={classNames.cohortPickerLabel}>
            {
              "Select a dataset cohort and measure to explore" // TODO: Replace with localization
            }
          </Text>
          {cohortOptions && (
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
              id="dataBalancerCohortDropdown"
              options={cohortOptions}
              selectedKey={this.state.selectedCohortIndex}
              onChange={this.setSelectedCohort}
            />
          )}
          {measureOptions && (
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
              id="dataBalancerCohortDropdown"
              options={measureOptions}
              selectedKey={this.state.selectedMeasureIndex}
              onChange={this.setSelectedMeasure}
            />
          )}
        </div>
        <br />
        <AccessibleChart plotlyProps={plotlyProps} theme={getTheme()} />
      </div>
    );
  }

  private setSelectedCohort = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item?.key !== undefined) {
      this.setState({ selectedCohortIndex: item.key as number });
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

function generatePlotlyProps(
  dataBalanceMeasures: IDataBalanceMeasures,
  datasetName?: string,
  selectedFeature?: string,
  selectedMeasure?: [string, string]
): IPlotlyProperty {
  const plotlyProps = _.cloneDeep(basePlotlyProperties);
  plotlyProps.data[0].type = "heatmap";

  if (!selectedFeature || !selectedMeasure) {
    return plotlyProps;
  }

  const [measureName, measureVar] = selectedMeasure;

  const features = new Map<string, string[]>();
  features.set(
    selectedFeature,
    dataBalanceMeasures.featureBalanceMeasures.featureValues[selectedFeature]
  );

  const featureNames = features.get(selectedFeature);
  plotlyProps.data[0].x = featureNames;
  plotlyProps.data[0].y = featureNames;

  const layout = plotlyProps.layout as Partial<Layout>;

  const title = layout.title as Partial<{ text: string }>;
  title.text = `${measureName} of ${selectedFeature}`;

  if (datasetName) {
    title.text += ` in ${datasetName}`;
  }

  // TODO: Make colorscale/zmin/zmax work with default colors and a min/max of -1/1
  // Choose a color palette friendly to people with color deficiency
  // plotlyProps.data[0].colorscale = [
  //   [0, "rgba(0,0,255,1.0)"],
  //   [1, "rgba(255,0,0,1.0)"]
  // ];

  // TODO: Need to fix "stretchy" visualization after going from half browser size to full browser size

  const data: number[][] = [];
  const annotations: Array<Partial<Annotations>> = [];

  features.forEach((classes, featureName) => {
    classes.forEach((classA, colIndex) => {
      const row: number[] = [];
      classes.forEach((classB, rowIndex) => {
        // TODO: Need to figure out which measures are ok to use for heatmap
        const featureValue = getFeatureBalanceMeasures(
          dataBalanceMeasures.featureBalanceMeasures.measures,
          featureName,
          classA,
          classB
        )[measureVar];

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
