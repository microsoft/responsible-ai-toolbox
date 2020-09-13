import Plotly from "plotly.js";
import React from "react";
import {
  AccessibleChart,
  IPlotlyProperty,
  PlotlyMode
} from "@responsible-ai/mlchartlib";
import _ from "lodash";
import {
  IProcessedStyleSet,
  getTheme,
  IDropdownOption,
  Dropdown,
  IconButton,
  DefaultButton,
  PrimaryButton,
  Icon,
  Text,
  Callout,
  DirectionalHint,
  ChoiceGroup,
  IChoiceGroupOption
} from "office-ui-fabric-react";
import { localization } from "../../../Localization/localization";
import { FabricStyles } from "../../FabricStyles";
import { JointDataset, ColumnCategories } from "../../JointDataset";
import { IExplanationModelMetadata } from "../../IExplanationContext";
import { ISelectorConfig } from "../../NewExplanationDashboard";
import { ChartTypes } from "../../ChartTypes";
import { IGenericChartProps } from "../../IGenericChartProps";
import { AxisConfigDialog } from "../AxisConfigurationDialog/AxisConfigDialog";
import { Cohort } from "../../Cohort";
import { CohortKey } from "../../CohortKey";
import {
  datasetExplorerTabStyles,
  IDatasetExplorerTabStyles
} from "./DatasetExplorerTab.styles";

export const newExplanationDashboardRowErrorSize = 10000;
export interface IDatasetExplorerTabProps {
  chartProps?: IGenericChartProps;
  theme?: string;
  jointDataset: JointDataset;
  metadata: IExplanationModelMetadata;
  cohorts: Cohort[];
  onChange: (props: IGenericChartProps) => void;
  editCohort: (index: number) => void;
}

export interface IDatasetExplorerTabState {
  xDialogOpen: boolean;
  yDialogOpen: boolean;
  colorDialogOpen: boolean;
  selectedCohortIndex: number;
  calloutVisible: boolean;
}

export class DatasetExplorerTab extends React.PureComponent<
  IDatasetExplorerTabProps,
  IDatasetExplorerTabState
> {
  public static basePlotlyProperties: IPlotlyProperty = {
    config: { displaylogo: false, responsive: true, displayModeBar: false },
    data: [{}],
    layout: {
      dragmode: false,
      autosize: true,
      font: {
        size: 10
      },
      margin: {
        t: 0,
        l: 20,
        b: 20,
        r: 0
      },
      hovermode: "closest",
      showlegend: false,
      yaxis: {
        automargin: true,
        color: FabricStyles.chartAxisColor,
        tickfont: {
          family: "Roboto, Helvetica Neue, sans-serif",
          size: 11
        },
        zeroline: true,
        showgrid: true,
        gridcolor: "#e5e5e5"
      },
      xaxis: {
        mirror: true,
        color: FabricStyles.chartAxisColor,
        tickfont: {
          family: FabricStyles.fontFamilies,
          size: 11
        },
        zeroline: true
      }
    } as any
  };

  private readonly chartAndConfigsId = "chart-and-axis-config-id";
  private readonly _chartConfigId = "chart-config-button";
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

  public constructor(props: IDatasetExplorerTabProps) {
    super(props);
    this.state = {
      xDialogOpen: false,
      yDialogOpen: false,
      colorDialogOpen: false,
      calloutVisible: false,
      selectedCohortIndex: 0
    };
    if (!this.props.jointDataset.hasDataset) {
      return;
    }
    if (props.chartProps === undefined) {
      this.generateDefaultChartAxes();
    }
  }

  private static generatePlotlyProps(
    jointData: JointDataset,
    chartProps: IGenericChartProps,
    cohort: Cohort
  ): IPlotlyProperty {
    const plotlyProps = _.cloneDeep(DatasetExplorerTab.basePlotlyProperties);
    plotlyProps.data[0].hoverinfo = "all";

    switch (chartProps.chartType) {
      case ChartTypes.Scatter: {
        if (
          chartProps.colorAxis &&
          (chartProps.colorAxis.options.bin ||
            jointData.metaDict[chartProps.colorAxis.property]
              .treatAsCategorical)
        ) {
          cohort.sort(chartProps.colorAxis.property);
        }
        plotlyProps.data[0].type = chartProps.chartType;
        plotlyProps.data[0].mode = PlotlyMode.markers;
        if (chartProps.xAxis) {
          if (
            jointData.metaDict[chartProps.xAxis.property].treatAsCategorical
          ) {
            const xLabels =
              jointData.metaDict[chartProps.xAxis.property]
                .sortedCategoricalValues;
            const xLabelIndexes = xLabels?.map((_, index) => index);
            _.set(plotlyProps, "layout.xaxis.ticktext", xLabels);
            _.set(plotlyProps, "layout.xaxis.tickvals", xLabelIndexes);
          }
          const rawX = cohort.unwrap(chartProps.xAxis.property);
          if (chartProps.xAxis.options.dither) {
            const dithered = cohort.unwrap(JointDataset.DitherLabel);
            plotlyProps.data[0].x = dithered.map((dither, index) => {
              return rawX[index] + dither;
            });
          } else {
            plotlyProps.data[0].x = rawX;
          }
        }
        if (chartProps.yAxis) {
          if (
            jointData.metaDict[chartProps.yAxis.property].treatAsCategorical
          ) {
            const yLabels =
              jointData.metaDict[chartProps.yAxis.property]
                .sortedCategoricalValues;
            const yLabelIndexes = yLabels?.map((_, index) => index);
            _.set(plotlyProps, "layout.yaxis.ticktext", yLabels);
            _.set(plotlyProps, "layout.yaxis.tickvals", yLabelIndexes);
          }
          const rawY = cohort.unwrap(chartProps.yAxis.property);
          if (chartProps.yAxis.options.dither) {
            const dithered = cohort.unwrap(JointDataset.DitherLabel2);
            plotlyProps.data[0].y = dithered.map((dither, index) => {
              return rawY[index] + dither;
            });
          } else {
            plotlyProps.data[0].y = rawY;
          }
        }
        if (chartProps.colorAxis) {
          const isBinned =
            chartProps.colorAxis.options && chartProps.colorAxis.options.bin;
          const rawColor = cohort.unwrap(
            chartProps.colorAxis.property,
            isBinned
          );

          if (
            jointData.metaDict[chartProps.colorAxis.property]
              .treatAsCategorical ||
            isBinned
          ) {
            const styles = jointData.metaDict[
              chartProps.colorAxis.property
            ].sortedCategoricalValues?.map((label, index) => {
              return {
                target: index,
                value: {
                  name: label,
                  marker: {
                    color: FabricStyles.fabricColorPalette[index]
                  }
                }
              };
            });
            plotlyProps.data[0].transforms = [
              {
                type: "groupby",
                groups: rawColor,
                styles
              }
            ];
            if (plotlyProps.layout) {
              plotlyProps.layout.showlegend = false;
            }
          } else {
            plotlyProps.data[0].marker = {
              color: rawColor,
              colorbar: {
                title: {
                  side: "right",
                  text: jointData.metaDict[chartProps.colorAxis.property].label
                } as any
              },
              colorscale: "Bluered"
            };
          }
        }
        break;
      }
      case ChartTypes.Histogram: {
        cohort.sort(chartProps.yAxis.property);
        const rawX = cohort.unwrap(chartProps.xAxis.property, true);
        const xMeta = jointData.metaDict[chartProps.xAxis.property];
        const yMeta = jointData.metaDict[chartProps.yAxis.property];
        const xLabels = xMeta.sortedCategoricalValues;
        const xLabelIndexes = xLabels?.map((_, index) => index);
        // color series will be set by the y axis if it is categorical, otherwise no color for aggregate charts
        if (!jointData.metaDict[chartProps.yAxis.property].treatAsCategorical) {
          plotlyProps.data[0].type = "box";
          if (plotlyProps.layout) {
            plotlyProps.layout.hovermode = false;
          }
          plotlyProps.data[0].x = rawX;
          plotlyProps.data[0].y = cohort.unwrap(
            chartProps.yAxis.property,
            false
          );
          plotlyProps.data[0].marker = {
            color: FabricStyles.fabricColorPalette[0]
          };
          _.set(plotlyProps, "layout.xaxis.ticktext", xLabels);
          _.set(plotlyProps, "layout.xaxis.tickvals", xLabelIndexes);
          break;
        }
        plotlyProps.data[0].type = "bar";

        const y = new Array(rawX.length).fill(1);
        plotlyProps.data[0].text = rawX.map((index) => xLabels?.[index] || "");
        plotlyProps.data[0].x = rawX;
        plotlyProps.data[0].y = y;
        _.set(plotlyProps, "layout.xaxis.ticktext", xLabels);
        _.set(plotlyProps, "layout.xaxis.tickvals", xLabelIndexes);
        const transforms: Array<Partial<Plotly.Transform>> = [
          {
            type: "aggregate",
            groups: rawX,
            aggregations: [{ target: "y", func: "sum" }]
          }
        ];
        if (
          chartProps.yAxis &&
          chartProps.yAxis.property !== ColumnCategories.none
        ) {
          const rawColor = cohort.unwrap(chartProps.yAxis.property, true);
          const styles = yMeta.sortedCategoricalValues?.map((label, index) => {
            return {
              target: index,
              value: {
                name: label,
                marker: {
                  color: FabricStyles.fabricColorPalette[index]
                }
              }
            };
          });
          transforms.push({
            type: "groupby",
            groups: rawColor,
            styles
          });
        }
        plotlyProps.data[0].transforms = transforms;
        break;
      }
      default:
    }
    plotlyProps.data[0].customdata = this.buildCustomData(
      jointData,
      chartProps,
      cohort
    );
    plotlyProps.data[0].hovertemplate = this.buildHoverTemplate(
      jointData,
      chartProps
    );
    return plotlyProps;
  }

  private static buildHoverTemplate(
    jointData: JointDataset,
    chartProps: IGenericChartProps
  ): string {
    let hovertemplate = "";
    const xName = jointData.metaDict[chartProps.xAxis.property].label;
    const yName = jointData.metaDict[chartProps.yAxis.property].label;
    switch (chartProps.chartType) {
      case ChartTypes.Scatter: {
        if (chartProps.xAxis) {
          if (chartProps.xAxis.options.dither) {
            hovertemplate += xName + ": %{customdata.X}<br>";
          } else {
            hovertemplate += xName + ": %{x}<br>";
          }
        }
        if (chartProps.yAxis) {
          if (chartProps.yAxis.options.dither) {
            hovertemplate += yName + ": %{customdata.Y}<br>";
          } else {
            hovertemplate += yName + ": %{y}<br>";
          }
        }
        if (chartProps.colorAxis) {
          hovertemplate +=
            jointData.metaDict[chartProps.colorAxis.property].label +
            ": %{customdata.Color}<br>";
        }
        hovertemplate +=
          localization.Charts.rowIndex + ": %{customdata.AbsoluteIndex}<br>";
        break;
      }
      case ChartTypes.Histogram: {
        hovertemplate += xName + ": %{text}<br>";
        if (
          chartProps.yAxis.property !== ColumnCategories.none &&
          jointData.metaDict[chartProps.yAxis.property].treatAsCategorical
        ) {
          hovertemplate += yName + ": %{customdata.Y}<br>";
        }
        hovertemplate += localization.formatString(
          localization.Charts.countTooltipPrefix,
          "%{y}<br>"
        );
        break;
      }
      default:
    }
    hovertemplate += "<extra></extra>";
    return hovertemplate;
  }

  private static buildCustomData(
    jointData: JointDataset,
    chartProps: IGenericChartProps,
    cohort: Cohort
  ): any[] {
    const customdata = cohort.unwrap(JointDataset.IndexLabel).map((val) => {
      const dict = {};
      dict[JointDataset.IndexLabel] = val;
      return dict;
    });
    if (chartProps.chartType === ChartTypes.Scatter) {
      const xAxis = chartProps.xAxis;
      if (xAxis && xAxis.property && xAxis.options.dither) {
        const rawX = cohort.unwrap(chartProps.xAxis.property);
        rawX.forEach((val, index) => {
          // If categorical, show string value in tooltip
          if (
            jointData.metaDict[chartProps.xAxis.property].treatAsCategorical
          ) {
            customdata[index]["X"] =
              jointData.metaDict[
                chartProps.xAxis.property
              ].sortedCategoricalValues?.[val];
          } else {
            customdata[index]["X"] = (val as number).toLocaleString(undefined, {
              maximumFractionDigits: 3
            });
          }
        });
      }
      const yAxis = chartProps.yAxis;
      if (yAxis && yAxis.property && yAxis.options.dither) {
        const rawY = cohort.unwrap(chartProps.yAxis.property);
        rawY.forEach((val, index) => {
          // If categorical, show string value in tooltip
          if (
            jointData.metaDict[chartProps.yAxis.property].treatAsCategorical
          ) {
            customdata[index]["Y"] =
              jointData.metaDict[
                chartProps.yAxis.property
              ].sortedCategoricalValues?.[val];
          } else {
            customdata[index]["Y"] = (val as number).toLocaleString(undefined, {
              maximumFractionDigits: 3
            });
          }
        });
      }
      const colorAxis = chartProps.colorAxis;
      if (colorAxis && colorAxis.property) {
        const rawColor = cohort.unwrap(colorAxis.property);
        rawColor.forEach((val, index) => {
          if (jointData.metaDict[colorAxis.property].treatAsCategorical) {
            customdata[index]["Color"] =
              jointData.metaDict[colorAxis.property].sortedCategoricalValues?.[
                val
              ];
          } else {
            customdata[index]["Color"] = val.toLocaleString(undefined, {
              maximumFractionDigits: 3
            });
          }
        });
      }
      const indices = cohort.unwrap(JointDataset.IndexLabel, false);
      indices.forEach((absoluteIndex, i) => {
        customdata[i]["AbsoluteIndex"] = absoluteIndex;
      });
    }
    if (
      chartProps.chartType === ChartTypes.Histogram &&
      chartProps.yAxis.property !== ColumnCategories.none
    ) {
      const yMeta = jointData.metaDict[chartProps.yAxis.property];
      if (yMeta.treatAsCategorical) {
        const rawY = cohort.unwrap(chartProps.yAxis.property);
        rawY.forEach((val, index) => {
          customdata[index]["Y"] = yMeta.sortedCategoricalValues?.[val];
        });
      }
    }
    return customdata;
  }
  public render(): React.ReactNode {
    const classNames = datasetExplorerTabStyles();

    if (!this.props.jointDataset.hasDataset) {
      return (
        <div className={classNames.missingParametersPlaceholder}>
          <div className={classNames.missingParametersPlaceholderSpacer}>
            <Text variant="large" className={classNames.faintText}>
              {localization.DatasetExplorer.missingParameters}
            </Text>
          </div>
        </div>
      );
    }
    if (this.props.chartProps === undefined) {
      return <div />;
    }
    const plotlyProps = DatasetExplorerTab.generatePlotlyProps(
      this.props.jointDataset,
      this.props.chartProps,
      this.props.cohorts[this.state.selectedCohortIndex]
    );
    const cohortOptions =
      this.props.chartProps.xAxis.property !== CohortKey
        ? this.props.cohorts.map((cohort, index) => {
            return { key: index, text: cohort.name };
          })
        : undefined;
    const legend = this.buildColorLegend(classNames);
    const cohortLength = this.props.cohorts[this.state.selectedCohortIndex]
      .filteredData.length;
    const canRenderChart =
      cohortLength < newExplanationDashboardRowErrorSize ||
      this.props.chartProps.chartType !== ChartTypes.Scatter;
    const yAxisCategories = [
      ColumnCategories.index,
      ColumnCategories.dataset,
      ColumnCategories.outcome
    ];
    if (this.props.chartProps.chartType !== ChartTypes.Scatter) {
      yAxisCategories.push(ColumnCategories.none);
    }
    const isHistogram =
      this.props.chartProps.chartType !== ChartTypes.Scatter &&
      (this.props.chartProps.yAxis === undefined ||
        this.props.jointDataset.metaDict[this.props.chartProps.yAxis.property]
          .treatAsCategorical);
    return (
      <div className={classNames.page}>
        <div className={classNames.infoWithText}>
          <Icon iconName="Info" className={classNames.infoIcon} />
          <Text variant="medium" className={classNames.helperText}>
            {localization.DatasetExplorer.helperText}
          </Text>
        </div>
        <div className={classNames.cohortPickerWrapper}>
          <Text variant="mediumPlus" className={classNames.cohortPickerLabel}>
            {localization.ModelPerformance.cohortPickerLabel}
          </Text>
          {cohortOptions && (
            <Dropdown
              styles={{ dropdown: { width: 150 } }}
              options={cohortOptions}
              selectedKey={this.state.selectedCohortIndex}
              onChange={this.setSelectedCohort}
            />
          )}
        </div>
        <div className={classNames.mainArea}>
          <div className={classNames.chartWithAxes} id={this.chartAndConfigsId}>
            {this.state.yDialogOpen && (
              <AxisConfigDialog
                jointDataset={this.props.jointDataset}
                orderedGroupTitles={yAxisCategories}
                selectedColumn={this.props.chartProps.yAxis}
                canBin={false}
                mustBin={false}
                canDither={
                  this.props.chartProps.chartType === ChartTypes.Scatter
                }
                onAccept={this.onYSet}
                onCancel={this.setYOpen.bind(this, false)}
                target={`#${this.chartAndConfigsId}`}
              />
            )}
            {this.state.xDialogOpen && (
              <AxisConfigDialog
                jointDataset={this.props.jointDataset}
                orderedGroupTitles={[
                  ColumnCategories.index,
                  ColumnCategories.dataset,
                  ColumnCategories.outcome
                ]}
                selectedColumn={this.props.chartProps.xAxis}
                canBin={
                  this.props.chartProps.chartType === ChartTypes.Histogram ||
                  this.props.chartProps.chartType === ChartTypes.Box
                }
                mustBin={
                  this.props.chartProps.chartType === ChartTypes.Histogram ||
                  this.props.chartProps.chartType === ChartTypes.Box
                }
                canDither={
                  this.props.chartProps.chartType === ChartTypes.Scatter
                }
                onAccept={this.onXSet}
                onCancel={this.setXOpen.bind(this, false)}
                target={`#${this.chartAndConfigsId}`}
              />
            )}
            {this.state.colorDialogOpen && this.props.chartProps.colorAxis && (
              <AxisConfigDialog
                jointDataset={this.props.jointDataset}
                orderedGroupTitles={[
                  ColumnCategories.index,
                  ColumnCategories.dataset,
                  ColumnCategories.outcome
                ]}
                selectedColumn={this.props.chartProps.colorAxis}
                canBin={true}
                mustBin={false}
                canDither={false}
                onAccept={this.onColorSet}
                onCancel={this.setColorOpen.bind(this, false)}
                target={`#${this.chartAndConfigsId}`}
              />
            )}
            <div className={classNames.chartWithVertical}>
              <div className={classNames.verticalAxis}>
                <div className={classNames.rotatedVerticalBox}>
                  <div>
                    <Text
                      block
                      variant="mediumPlus"
                      className={classNames.boldText}
                    >
                      {isHistogram
                        ? localization.Charts.numberOfDatapoints
                        : localization.Charts.yValue}
                    </Text>
                    <DefaultButton
                      onClick={this.setYOpen.bind(this, true)}
                      text={
                        this.props.jointDataset.metaDict[
                          this.props.chartProps.yAxis.property
                        ].abbridgedLabel
                      }
                      title={
                        this.props.jointDataset.metaDict[
                          this.props.chartProps.yAxis.property
                        ].label
                      }
                    />
                  </div>
                </div>
              </div>
              <IconButton
                className={classNames.chartEditorButton}
                onClick={this.toggleCalloutOpen}
                iconProps={{ iconName: "Settings" }}
                id={this._chartConfigId}
              />
              {this.state.calloutVisible && (
                <Callout
                  doNotLayer={true}
                  className={classNames.callout}
                  gapSpace={0}
                  target={"#" + this._chartConfigId}
                  isBeakVisible={false}
                  onDismiss={this.closeCallout}
                  directionalHint={DirectionalHint.bottomRightEdge}
                  setInitialFocus={true}
                  styles={{ container: FabricStyles.calloutContainer }}
                >
                  <Text variant="medium" className={classNames.boldText}>
                    {localization.DatasetExplorer.chartType}
                  </Text>
                  <ChoiceGroup
                    selectedKey={this.props.chartProps.chartType}
                    options={this.chartOptions}
                    onChange={this.onChartTypeChange}
                  />
                </Callout>
              )}
              {!canRenderChart && (
                <div className={classNames.missingParametersPlaceholder}>
                  <div
                    className={classNames.missingParametersPlaceholderSpacer}
                  >
                    <Text
                      block
                      variant="large"
                      className={classNames.faintText}
                    >
                      {localization.ValidationErrors.datasizeError}
                    </Text>
                    <PrimaryButton onClick={this.editCohort}>
                      {localization.ValidationErrors.addFilters}
                    </PrimaryButton>
                  </div>
                </div>
              )}
              {canRenderChart && (
                <AccessibleChart
                  plotlyProps={plotlyProps}
                  theme={getTheme() as any}
                />
              )}
            </div>
            <div className={classNames.horizontalAxisWithPadding}>
              <div className={classNames.paddingDiv}></div>
              <div className={classNames.horizontalAxis}>
                <div>
                  <Text
                    block
                    variant="mediumPlus"
                    className={classNames.boldText}
                  >
                    {localization.Charts.xValue}
                  </Text>
                  <DefaultButton
                    onClick={this.setXOpen.bind(this, true)}
                    text={
                      this.props.jointDataset.metaDict[
                        this.props.chartProps.xAxis.property
                      ].abbridgedLabel
                    }
                    title={
                      this.props.jointDataset.metaDict[
                        this.props.chartProps.xAxis.property
                      ].label
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={classNames.legendAndText}>
            <Text variant={"mediumPlus"} block className={classNames.boldText}>
              {localization.DatasetExplorer.colorValue}
            </Text>
            {this.props.chartProps.chartType === ChartTypes.Scatter && (
              <DefaultButton
                onClick={this.setColorOpen.bind(this, true)}
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
            {legend}
          </div>
        </div>
      </div>
    );
  }

  private editCohort = (): void => {
    this.props.editCohort(this.state.selectedCohortIndex);
  };

  private setSelectedCohort = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item?.key !== undefined) {
      this.setState({ selectedCohortIndex: item.key as number });
    }
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
    if (newProps.yAxis.property === ColumnCategories.none) {
      newProps.yAxis = this.generateDefaultYAxis();
    }
    this.props.onChange(newProps);
  };

  private readonly setXOpen = (val: boolean): void => {
    if (val && this.state.xDialogOpen === false) {
      this.setState({ xDialogOpen: true });
      return;
    }
    this.setState({ xDialogOpen: false });
  };

  private readonly setColorOpen = (val: boolean): void => {
    if (val && this.state.colorDialogOpen === false) {
      this.setState({ colorDialogOpen: true });
      return;
    }
    this.setState({ colorDialogOpen: false });
  };

  private readonly setYOpen = (val: boolean): void => {
    if (val && this.state.yDialogOpen === false) {
      this.setState({ yDialogOpen: true });
      return;
    }
    this.setState({ yDialogOpen: false });
  };

  private onXSet = (value: ISelectorConfig): void => {
    if (!this.props.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.props.chartProps);
    newProps.xAxis = value;
    this.props.onChange(newProps);
    this.setState({ xDialogOpen: false });
  };

  private onYSet = (value: ISelectorConfig): void => {
    if (!this.props.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.props.chartProps);
    newProps.yAxis = value;
    this.props.onChange(newProps);
    this.setState({ yDialogOpen: false });
  };

  private onColorSet = (value: ISelectorConfig): void => {
    if (!this.props.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.props.chartProps);
    newProps.colorAxis = value;
    this.props.onChange(newProps);
    this.setState({ colorDialogOpen: false });
  };

  private toggleCalloutOpen = (): void => {
    this.setState({ calloutVisible: !this.state.calloutVisible });
  };

  private closeCallout = (): void => {
    this.setState({ calloutVisible: false });
  };

  private buildColorLegend(
    classNames: IProcessedStyleSet<IDatasetExplorerTabStyles>
  ): React.ReactNode {
    if (!this.props.chartProps) {
      return;
    }
    let colorSeries = [];
    if (this.props.chartProps.chartType === ChartTypes.Scatter) {
      const colorAxis = this.props.chartProps.colorAxis;
      if (
        colorAxis &&
        (colorAxis.options.bin ||
          this.props.jointDataset.metaDict[colorAxis.property]
            .treatAsCategorical)
      ) {
        this.props.cohorts[this.state.selectedCohortIndex].sort(
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
        colorAxis.property !== ColumnCategories.none
      ) {
        this.props.cohorts[this.state.selectedCohortIndex].sort(
          colorAxis.property
        );
        const includedIndexes = _.uniq(
          this.props.cohorts[this.state.selectedCohortIndex].unwrap(
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
    return (
      <div className={classNames.legend}>
        {colorSeries.map((name, i) => {
          return (
            <div className={classNames.legendItem} key={i}>
              <div
                className={classNames.colorBox}
                style={{ backgroundColor: FabricStyles.fabricColorPalette[i] }}
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
        })}
        {colorSeries.length === 0 && (
          <Text variant={"xSmall"} className={classNames.smallItalic}>
            {localization.DatasetExplorer.noColor}
          </Text>
        )}
      </div>
    );
  }

  private generateDefaultChartAxes(): void {
    const chartProps: IGenericChartProps = {
      chartType: ChartTypes.Histogram,
      xAxis: {
        property: JointDataset.IndexLabel,
        options: {}
      },
      yAxis: this.generateDefaultYAxis(),
      colorAxis: {
        property: this.props.jointDataset.hasPredictedY
          ? JointDataset.PredictedYLabel
          : JointDataset.IndexLabel,
        options: {}
      }
    };
    this.props.onChange(chartProps);
  }

  private generateDefaultYAxis(): ISelectorConfig {
    const yKey = JointDataset.DataLabelRoot + "0";
    const yIsDithered = this.props.jointDataset.metaDict[yKey]
      .treatAsCategorical;
    return {
      property: yKey,
      options: {
        dither: yIsDithered,
        bin: false
      }
    };
  }
}
