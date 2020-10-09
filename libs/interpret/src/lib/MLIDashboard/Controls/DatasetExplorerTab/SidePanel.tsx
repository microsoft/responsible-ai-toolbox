// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import _ from "lodash";
import {
  ChoiceGroup,
  DefaultButton,
  IChoiceGroupOption,
  Text
} from "office-ui-fabric-react";
import React from "react";

import { localization } from "@responsible-ai/localization";
import { ChartTypes } from "../../ChartTypes";
import { Cohort } from "../../Cohort";
import { FabricStyles } from "../../FabricStyles";
import { IGenericChartProps } from "../../IGenericChartProps";
import { ColumnCategories, JointDataset } from "../../JointDataset";

import { datasetExplorerTabStyles } from "./DatasetExplorerTab.styles";

export interface ISidePanelProps {
  chartProps: IGenericChartProps;
  jointDataset: JointDataset;
  cohorts: Cohort[];
  selectedCohortIndex: number;
  setColorOpen(): void;
  onChartTypeChange(
    ev?: React.SyntheticEvent<HTMLElement>,
    item?: IChoiceGroupOption
  ): void;
}

export class SidePanel extends React.Component<ISidePanelProps> {
  private readonly chartOptions: IChoiceGroupOption[] = [
    {
      key: ChartTypes.Histogram,
      text: localization.DatasetExplorer.aggregatePlots
    },
    {
      key: ChartTypes.Scatter,
      text: localization.DatasetExplorer.individualDatapoints
    }
  ];
  public render(): React.ReactNode {
    const classNames = datasetExplorerTabStyles();
    const colorSeries = this.buildColorLegend();
    return (
      <div className={classNames.legendAndText}>
        <Text variant={"mediumPlus"} block className={classNames.boldText}>
          {localization.DatasetExplorer.colorValue}
        </Text>
        {this.props.chartProps.chartType === ChartTypes.Scatter && (
          <DefaultButton
            onClick={this.props.setColorOpen}
            text={
              this.props.chartProps.colorAxis &&
              this.props.jointDataset.metaDict[
                this.props.chartProps.colorAxis.property
              ].abbridgedLabel
            }
            title={
              this.props.chartProps.colorAxis &&
              this.props.jointDataset.metaDict[
                this.props.chartProps.colorAxis.property
              ].label
            }
          />
        )}
        <div className={classNames.legend}>
          {colorSeries?.length ? (
            colorSeries.map((name, i) => {
              return (
                <div className={classNames.legendItem} key={i}>
                  <div
                    className={classNames.colorBox}
                    style={{
                      backgroundColor: FabricStyles.fabricColorPalette[i]
                    }}
                  />
                  <Text
                    nowrap
                    variant={"medium"}
                    className={classNames.legendLabel}
                  >
                    {name}
                  </Text>
                </div>
              );
            })
          ) : (
            <Text variant={"xSmall"} className={classNames.smallItalic}>
              {localization.DatasetExplorer.noColor}
            </Text>
          )}
        </div>

        <ChoiceGroup
          id="ChartTypeSelection"
          label={localization.DatasetExplorer.chartType}
          selectedKey={this.props.chartProps.chartType}
          options={this.chartOptions}
          onChange={this.props.onChartTypeChange}
        />
      </div>
    );
  }

  private buildColorLegend(): string[] | undefined {
    if (!this.props.chartProps) {
      return;
    }
    let colorSeries: string[] = [];
    if (this.props.chartProps.chartType === ChartTypes.Scatter) {
      const colorAxis = this.props.chartProps.colorAxis;
      if (
        colorAxis &&
        (colorAxis.options.bin ||
          this.props.jointDataset.metaDict[colorAxis.property]
            .treatAsCategorical)
      ) {
        this.props.cohorts[this.props.selectedCohortIndex].sort(
          colorAxis.property
        );
        colorSeries =
          this.props.jointDataset.metaDict[colorAxis.property]
            .sortedCategoricalValues || [];
      } else {
        // continuous color, handled by plotly for now
        return;
      }
    } else {
      const colorAxis = this.props.chartProps.yAxis;
      if (
        this.props.jointDataset.metaDict[colorAxis.property]
          .treatAsCategorical &&
        colorAxis.property !== ColumnCategories.None
      ) {
        this.props.cohorts[this.props.selectedCohortIndex].sort(
          colorAxis.property
        );
        const includedIndexes = _.uniq(
          this.props.cohorts[this.props.selectedCohortIndex].unwrap(
            colorAxis.property
          )
        );
        colorSeries = this.props.jointDataset.metaDict[colorAxis.property]
          .treatAsCategorical
          ? includedIndexes.map(
              (category) =>
                this.props.jointDataset.metaDict[colorAxis.property]
                  .sortedCategoricalValues?.[category]
            )
          : includedIndexes;
      }
    }
    return colorSeries;
  }
}
