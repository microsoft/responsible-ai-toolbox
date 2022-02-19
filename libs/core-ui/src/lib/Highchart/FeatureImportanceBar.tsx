// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import { getTheme, Text } from "office-ui-fabric-react";
import React from "react";

// import { LoadingSpinner } from "../components/LoadingSpinner";
// import { FabricStyles } from "../util/FabricStyles";
import { getFeatureImportanceBarOptions } from "../util/getFeatureImportanceBarOptions";
import { ChartTypes } from "../util/IGenericChartProps";
import { JointDataset } from "../util/JointDataset";
// import { PartialRequired } from "../util/PartialRequired";

import { BasicHighChart } from "./BasicHighChart";
import { featureImportanceBarStyles } from "./FeatureImportanceBar.styles";

export interface IGlobalSeries {
  unsortedAggregateY: number[];
  // feature x row, given how lookup is done
  unsortedIndividualY?: number[][];
  unsortedFeatureValues?: number[];
  name: string;
  colorIndex: number;
  id?: number;
}

export interface IFeatureBarProps {
  jointDataset: JointDataset | undefined;
  chartType: ChartTypes;
  yAxisLabels: string[];
  sortArray: number[];
  selectedFeatureIndex?: number;
  selectedSeriesIndex?: number;
  topK: number;
  unsortedX: string[];
  unsortedSeries: IGlobalSeries[];
  originX?: string[];
  xMapping?: string[];
  onFeatureSelection?: (seriesIndex: number, featureIndex: number) => void;
}

export class FeatureImportanceBar extends React.Component<IFeatureBarProps> {
  public componentDidUpdate(prevProps: IFeatureBarProps): void {
    if (
      this.props.unsortedSeries !== prevProps.unsortedSeries ||
      this.props.sortArray !== prevProps.sortArray ||
      this.props.chartType !== prevProps.chartType
    ) {
      this.forceUpdate();
    }
  }

  public render(): React.ReactNode {
    return (
      <div
        id="FeatureImportanceBar"
        className={featureImportanceBarStyles.chartWithVertical}
      >
        <div className={featureImportanceBarStyles.verticalAxis}>
          <div className={featureImportanceBarStyles.rotatedVerticalBox}>
            <div>
              {this.props.yAxisLabels.map((label, i) => (
                <Text
                  block
                  variant="medium"
                  className={featureImportanceBarStyles.boldText}
                  key={i}
                >
                  {label}
                </Text>
              ))}
            </div>
          </div>
        </div>
        <div className={featureImportanceBarStyles.container}>
          <BasicHighChart
            configOverride={getFeatureImportanceBarOptions(
              this.props.sortArray,
              this.props.unsortedX,
              this.props.unsortedSeries,
              this.props.topK,
              this.props.originX,
              getTheme(),
              this.props.onFeatureSelection
            )}
          />
        </div>
      </div>
    );
  }
}
