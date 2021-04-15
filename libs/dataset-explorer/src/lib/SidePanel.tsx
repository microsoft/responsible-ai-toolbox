// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ColumnCategories,
  ChartTypes,
  IGenericChartProps,
  FabricStyles,
  InteractiveLegend,
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import {
  ChoiceGroup,
  DefaultButton,
  IChoiceGroupOption,
  Label,
  Stack,
  Text
} from "office-ui-fabric-react";
import React from "react";

import { datasetExplorerTabStyles } from "./DatasetExplorerTab.styles";

export interface ISidePanelProps {
  chartProps: IGenericChartProps;
  setColorOpen(): void;
  onChartTypeChange(
    ev?: React.SyntheticEvent<HTMLElement>,
    item?: IChoiceGroupOption
  ): void;
}

export class SidePanel extends React.Component<ISidePanelProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  private readonly chartOptions: IChoiceGroupOption[] = [
    {
      key: ChartTypes.Histogram,
      text: localization.Interpret.DatasetExplorer.aggregatePlots
    },
    {
      key: ChartTypes.Scatter,
      text: localization.Interpret.DatasetExplorer.individualDatapoints
    }
  ];

  public render(): React.ReactNode {
    const classNames = datasetExplorerTabStyles();
    const colorSeries = this.buildColorLegend();
    return (
      <Stack>
        {this.props.chartProps.chartType === ChartTypes.Scatter && (
          <Stack.Item>
            <Label>{localization.Interpret.DatasetExplorer.colorValue}</Label>
            <DefaultButton
              id="SetColorButton"
              onClick={this.props.setColorOpen}
              text={
                this.props.chartProps.colorAxis &&
                this.context.jointDataset.metaDict[
                  this.props.chartProps.colorAxis.property
                ].abbridgedLabel
              }
              title={
                this.props.chartProps.colorAxis &&
                this.context.jointDataset.metaDict[
                  this.props.chartProps.colorAxis.property
                ].label
              }
            />
            <div className={classNames.legendAndText}>
              <div className={classNames.legend}>
                {colorSeries?.length ? (
                  <InteractiveLegend
                    items={colorSeries.map((name, i) => {
                      return {
                        activated: true,
                        color: FabricStyles.fabricColorPalette[i],
                        name
                      };
                    })}
                  />
                ) : (
                  <Text variant={"xSmall"} className={classNames.smallItalic}>
                    {localization.Interpret.DatasetExplorer.noColor}
                  </Text>
                )}
              </div>
            </div>
          </Stack.Item>
        )}

        <ChoiceGroup
          id="ChartTypeSelection"
          label={localization.Interpret.DatasetExplorer.chartType}
          selectedKey={this.props.chartProps.chartType}
          options={this.chartOptions}
          onChange={this.props.onChartTypeChange}
        />
      </Stack>
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
          this.context.jointDataset.metaDict[colorAxis.property]
            .treatAsCategorical)
      ) {
        this.context.selectedCohort.cohort.sort(
          colorAxis.property
        );
        colorSeries =
          this.context.jointDataset.metaDict[colorAxis.property]
            .sortedCategoricalValues || [];
      } else {
        // continuous color, handled by plotly for now
        return;
      }
    } else {
      const colorAxis = this.props.chartProps.yAxis;
      if (
        this.context.jointDataset.metaDict[colorAxis.property]
          .treatAsCategorical &&
        colorAxis.property !== ColumnCategories.None
      ) {
        this.context.selectedCohort.cohort.sort(
          colorAxis.property
        );
        const includedIndexes = _.uniq(
          this.context.selectedCohort.cohort.unwrap(
            colorAxis.property
          )
        );
        colorSeries = this.context.jointDataset.metaDict[colorAxis.property]
          .treatAsCategorical
          ? includedIndexes.map(
              (category) =>
                this.context.jointDataset.metaDict[colorAxis.property]
                  .sortedCategoricalValues?.[category]
            )
          : includedIndexes;
      }
    }
    return colorSeries;
  }
}
