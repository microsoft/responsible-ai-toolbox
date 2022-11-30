// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ChoiceGroup,
  DefaultButton,
  IChoiceGroupOption,
  Label,
  Stack
} from "@fluentui/react";
import {
  ColumnCategories,
  JointDataset,
  Cohort,
  ChartTypes,
  IGenericChartProps,
  InteractiveLegend,
  FluentUIStyles,
  AxisConfigDialog,
  ISelectorConfig,
  TelemetryLevels,
  TelemetryEventName
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

import { datasetExplorerTabStyles } from "./DatasetExplorerTab.styles";
import { generateDefaultYAxis } from "./generateDefaultChartAxes";

export interface ISidePanelProps {
  chartProps: IGenericChartProps;
  jointDataset: JointDataset;
  cohorts: Cohort[];
  selectedCohortIndex: number;
  onChartPropChange: (p: IGenericChartProps) => void;
}
interface ISidePanelState {
  colorDialogOpen: boolean;
}

export class SidePanel extends React.Component<
  ISidePanelProps,
  ISidePanelState
> {
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
  public constructor(props: ISidePanelProps) {
    super(props);
    this.state = {
      colorDialogOpen: false
    };
  }
  public render(): React.ReactNode {
    const classNames = datasetExplorerTabStyles();
    const colorSeries = this.buildColorLegend();
    const scatterColors = FluentUIStyles.scatterFluentUIColorPalette;
    return (
      <Stack>
        <ChoiceGroup
          id="ChartTypeSelection"
          label={localization.Interpret.DatasetExplorer.chartType}
          selectedKey={this.props.chartProps.chartType}
          options={this.chartOptions}
          onChange={this.onChartTypeChange}
        />
        {this.state.colorDialogOpen && this.props.chartProps.colorAxis && (
          <AxisConfigDialog
            orderedGroupTitles={[
              ColumnCategories.Index,
              ColumnCategories.Dataset,
              ColumnCategories.Outcome
            ]}
            selectedColumn={this.props.chartProps.colorAxis}
            canBin
            mustBin={false}
            canDither={false}
            onAccept={this.onColorSet}
            onCancel={this.setColorClose}
          />
        )}
        {this.props.chartProps.chartType === ChartTypes.Scatter && (
          <Stack.Item>
            <Label className={classNames.colorValue}>
              {localization.Interpret.DatasetExplorer.colorValue}
            </Label>
            <DefaultButton
              id="SetColorButton"
              onClick={this.setColorOpen}
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
            <div className={classNames.legendAndText}>
              {colorSeries?.length && (
                <InteractiveLegend
                  items={colorSeries.map((name, i) => {
                    return {
                      activated: true,
                      color: scatterColors[i],
                      index: i,
                      name
                    };
                  })}
                />
              )}
            </div>
          </Stack.Item>
        )}
      </Stack>
    );
  }

  private readonly setColorOpen = (): void => {
    this.setState({ colorDialogOpen: true });
  };

  private onChartTypeChange = (
    _ev?: React.SyntheticEvent<HTMLElement>,
    item?: IChoiceGroupOption
  ): void => {
    const newProps = _.cloneDeep(this.props.chartProps);
    if (item?.key === undefined || !newProps) {
      return;
    }
    newProps.chartType = item.key as ChartTypes;
    if (newProps.yAxis.property === ColumnCategories.None) {
      newProps.yAxis = generateDefaultYAxis(this.context.jointDataset);
    }
    this.props.onChartPropChange(newProps);
    this.context.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: TelemetryEventName.DatasetExplorerNewChartTypeSelected
    });
  };
  private onColorSet = (value: ISelectorConfig): void => {
    if (!this.props.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.props.chartProps);
    newProps.colorAxis = value;
    this.props.onChartPropChange(newProps);
  };

  private readonly setColorClose = (): void => {
    this.setState({ colorDialogOpen: false });
  };

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
            ?.treatAsCategorical)
      ) {
        this.props.cohorts[this.props.selectedCohortIndex]?.sort(
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
          ?.treatAsCategorical &&
        colorAxis.property !== ColumnCategories.None
      ) {
        this.props.cohorts[this.props.selectedCohortIndex]?.sort(
          colorAxis.property
        );
        const includedIndexes = _.uniq(
          this.props.cohorts[this.props.selectedCohortIndex].unwrap(
            colorAxis.property
          )
        );
        colorSeries = this.props.jointDataset.metaDict[colorAxis.property]
          ?.treatAsCategorical
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
