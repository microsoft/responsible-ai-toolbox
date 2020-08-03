import React from "react";
import { getTheme } from "@uifabric/styling";
import _ from "lodash";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { AccessibleChart, IPlotlyProperty } from "@responsible-ai/mlchartlib";
import { Transform } from "plotly.js-dist";
import { IDropdownOption, Dropdown } from "office-ui-fabric-react/lib/Dropdown";
import { Icon, Text } from "office-ui-fabric-react";
import { AxisConfigDialog } from "../AxisConfigurationDialog/AxisConfigDialog";
import { localization } from "../../../Localization/localization";
import { Cohort } from "../../Cohort";
import { IExplanationModelMetadata, ModelTypes } from "../../IExplanationContext";
import { JointDataset, ColumnCategories } from "../../JointDataset";
import { IGenericChartProps, ISelectorConfig, ChartTypes } from "../../NewExplanationDashboard";
import { FabricStyles } from "../../FabricStyles";
import { ILabeledStatistic, generateMetrics } from "../../StatisticsUtils";
import { modelPerformanceTabStyles } from "./ModelPerformanceTab.styles";

export interface IModelPerformanceTabProps {
    chartProps: IGenericChartProps;
    theme?: string;
    jointDataset: JointDataset;
    metadata: IExplanationModelMetadata;
    cohorts: Cohort[];
    onChange: (props: IGenericChartProps) => void;
}

export interface IModelPerformanceTabState {
    xDialogOpen: boolean;
    yDialogOpen: boolean;
    selectedCohortIndex: number;
}

export class ModelPerformanceTab extends React.PureComponent<IModelPerformanceTabProps, IModelPerformanceTabState> {
    private readonly chartAndConfigsId = "chart-and-axis-config-id";

    constructor(props: IModelPerformanceTabProps) {
        super(props);
        this.state = {
            xDialogOpen: false,
            yDialogOpen: false,
            selectedCohortIndex: 0,
        };
        if (!this.props.jointDataset.hasPredictedY) {
            return;
        }
        if (props.chartProps === undefined) {
            this.generateDefaultChartAxes();
        }
        this.onXSet = this.onXSet.bind(this);
        this.onYSet = this.onYSet.bind(this);
        this.setXOpen = this.setXOpen.bind(this);
        this.setYOpen = this.setYOpen.bind(this);
        this.setSelectedCohort = this.setSelectedCohort.bind(this);
    }

    public render(): React.ReactNode {
        const classNames = modelPerformanceTabStyles();
        if (!this.props.jointDataset.hasPredictedY) {
            return (
                <div className={classNames.missingParametersPlaceholder}>
                    <div className={classNames.missingParametersPlaceholderSpacer}>
                        <Text variant="large" className={classNames.faintText}>
                            {localization.ModelPerformance.missingParameters}
                        </Text>
                    </div>
                </div>
            );
        }
        if (this.props.chartProps === undefined) {
            return <div />;
        }
        const plotlyProps = ModelPerformanceTab.generatePlotlyProps(
            this.props.jointDataset,
            this.props.chartProps,
            this.props.cohorts,
            this.state.selectedCohortIndex,
        );
        const metricsList = this.generateMetrics().reverse();
        const height = Math.max(400, 160 * metricsList.length) + "px";
        const cohortOptions: IDropdownOption[] =
            this.props.chartProps.yAxis.property !== Cohort.CohortKey
                ? this.props.cohorts.map((cohort, index) => {
                      return { key: index, text: cohort.name };
                  })
                : undefined;
        return (
            <div className={classNames.page}>
                <div className={classNames.infoWithText}>
                    <Icon iconName="Info" className={classNames.infoIcon} />
                    <Text variant="medium" className={classNames.helperText}>
                        {localization.ModelPerformance.helperText}
                    </Text>
                </div>
                {cohortOptions && (
                    <div className={classNames.cohortPickerWrapper}>
                        <Text variant="mediumPlus" className={classNames.cohortPickerLabel}>
                            {localization.ModelPerformance.cohortPickerLabel}
                        </Text>
                        <Dropdown
                            styles={{ dropdown: { width: 150 } }}
                            options={cohortOptions}
                            selectedKey={this.state.selectedCohortIndex}
                            onChange={this.setSelectedCohort}
                        />
                    </div>
                )}
                <div className={classNames.chartWithAxes} id={this.chartAndConfigsId}>
                    {this.state.yDialogOpen && (
                        <AxisConfigDialog
                            jointDataset={this.props.jointDataset}
                            orderedGroupTitles={[ColumnCategories.cohort, ColumnCategories.dataset]}
                            selectedColumn={this.props.chartProps.yAxis}
                            canBin={
                                this.props.chartProps.chartType === ChartTypes.Histogram ||
                                this.props.chartProps.chartType === ChartTypes.Box
                            }
                            mustBin={
                                this.props.chartProps.chartType === ChartTypes.Histogram ||
                                this.props.chartProps.chartType === ChartTypes.Box
                            }
                            canDither={this.props.chartProps.chartType === ChartTypes.Scatter}
                            onAccept={this.onYSet}
                            onCancel={this.setYOpen.bind(this, false)}
                            target={`#${this.chartAndConfigsId}`}
                        />
                    )}
                    {this.state.xDialogOpen && (
                        <AxisConfigDialog
                            jointDataset={this.props.jointDataset}
                            orderedGroupTitles={[ColumnCategories.outcome]}
                            selectedColumn={this.props.chartProps.xAxis}
                            canBin={false}
                            mustBin={false}
                            canDither={this.props.chartProps.chartType === ChartTypes.Scatter}
                            onAccept={this.onXSet}
                            onCancel={this.setXOpen.bind(this, false)}
                            target={`#${this.chartAndConfigsId}`}
                        />
                    )}
                    <div className={classNames.chartWithVertical}>
                        <div className={classNames.verticalAxis}>
                            <div className={classNames.rotatedVerticalBox}>
                                <div>
                                    <Text block variant="mediumPlus" className={classNames.boldText}>
                                        {localization.Charts.yValue}
                                    </Text>
                                    <DefaultButton
                                        onClick={this.setYOpen.bind(this, true)}
                                        text={
                                            this.props.jointDataset.metaDict[this.props.chartProps.yAxis.property]
                                                .abbridgedLabel
                                        }
                                        title={
                                            this.props.jointDataset.metaDict[this.props.chartProps.yAxis.property].label
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={classNames.scrollableWrapper}>
                            <div className={classNames.scrollContent} style={{ height }}>
                                <div className={classNames.chart}>
                                    <AccessibleChart plotlyProps={plotlyProps} theme={getTheme() as any} />
                                </div>
                                {this.props.metadata.modelType !== ModelTypes.multiclass && (
                                    <div className={classNames.rightPanel}>
                                        {!this.props.jointDataset.hasTrueY && (
                                            <div className={classNames.missingParametersPlaceholder}>
                                                <div className={classNames.missingParametersPlaceholderNeutralSpacer}>
                                                    <Text variant="large" className={classNames.faintText}>
                                                        {localization.ModelPerformance.missingTrueY}
                                                    </Text>
                                                </div>
                                            </div>
                                        )}
                                        {this.props.jointDataset.hasTrueY &&
                                            metricsList.map((stats, index) => {
                                                return (
                                                    <div className={classNames.statsBox} key={index}>
                                                        {stats.map((labeledStat, statIndex) => {
                                                            return (
                                                                <Text block key={statIndex}>
                                                                    {localization.formatString(
                                                                        labeledStat.label,
                                                                        labeledStat.stat.toLocaleString(undefined, {
                                                                            maximumFractionDigits: 3,
                                                                        }),
                                                                    )}
                                                                </Text>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={classNames.horizontalAxisWithPadding}>
                        <div className={classNames.paddingDiv}></div>
                        <div className={classNames.horizontalAxis}>
                            <div>
                                <Text block variant="mediumPlus" className={classNames.boldText}>
                                    {this.props.chartProps.chartType === ChartTypes.Histogram
                                        ? localization.Charts.numberOfDatapoints
                                        : localization.Charts.xValue}
                                </Text>
                                <DefaultButton
                                    onClick={this.setXOpen.bind(this, true)}
                                    text={
                                        this.props.jointDataset.metaDict[this.props.chartProps.xAxis.property]
                                            .abbridgedLabel
                                    }
                                    title={this.props.jointDataset.metaDict[this.props.chartProps.xAxis.property].label}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private setSelectedCohort(_: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void {
        this.setState({ selectedCohortIndex: item.key as number });
    }

    private readonly setXOpen = (val: boolean): void => {
        if (val && this.state.xDialogOpen === false) {
            this.setState({ xDialogOpen: true });
            return;
        }
        this.setState({ xDialogOpen: false });
    };

    private readonly setYOpen = (val: boolean): void => {
        if (val && this.state.yDialogOpen === false) {
            this.setState({ yDialogOpen: true });
            return;
        }
        this.setState({ yDialogOpen: false });
    };

    private onXSet(value: ISelectorConfig): void {
        const newProps = _.cloneDeep(this.props.chartProps);
        newProps.xAxis = value;
        newProps.chartType = this.props.jointDataset.metaDict[value.property].treatAsCategorical
            ? ChartTypes.Histogram
            : ChartTypes.Box;

        this.props.onChange(newProps);
        this.setState({ xDialogOpen: false });
    }

    private onYSet(value: ISelectorConfig): void {
        const newProps = _.cloneDeep(this.props.chartProps);
        newProps.yAxis = value;

        this.props.onChange(newProps);
        this.setState({ yDialogOpen: false });
    }

    private generateDefaultChartAxes(): void {
        let bestModelMetricKey: string;
        if (this.props.metadata.modelType === ModelTypes.binary && this.props.jointDataset.hasPredictedProbabilities) {
            bestModelMetricKey = JointDataset.ProbabilityYRoot + "0";
        } else if (this.props.metadata.modelType === ModelTypes.regression) {
            if (this.props.jointDataset.hasPredictedY && this.props.jointDataset.hasTrueY) {
                bestModelMetricKey = JointDataset.RegressionError;
            } else {
                bestModelMetricKey = JointDataset.PredictedYLabel;
            }
        } else {
            bestModelMetricKey = JointDataset.PredictedYLabel;
        } // not handling multiclass at this time

        const chartProps: IGenericChartProps = {
            chartType: this.props.jointDataset.metaDict[bestModelMetricKey].isCategorical
                ? ChartTypes.Histogram
                : ChartTypes.Box,
            yAxis: {
                property: Cohort.CohortKey,
                options: {},
            },
            xAxis: {
                property: bestModelMetricKey,
                options: {
                    bin: false,
                },
            },
        };
        this.props.onChange(chartProps);
    }

    private static generatePlotlyProps(
        jointData: JointDataset,
        chartProps: IGenericChartProps,
        cohorts: Cohort[],
        selectedCohortIndex: number,
    ): IPlotlyProperty {
        // In this view, y will always be categorical (including a binned numberic variable), and could be
        // iterations over the cohorts. We can set y and the y labels before the rest of the char properties.
        const plotlyProps: IPlotlyProperty = {
            config: { displaylogo: false, responsive: true, displayModeBar: false },
            data: [{}],
            layout: {
                dragmode: false,
                autosize: true,
                margin: {
                    l: 10,
                    t: 25,
                    b: 20,
                },
                hovermode: "closest",
                showlegend: false,
                yaxis: {
                    automargin: true,
                    color: FabricStyles.chartAxisColor,
                    tickfont: {
                        family: FabricStyles.fontFamilies,
                        size: 11,
                    },
                    showline: true,
                },
                xaxis: {
                    side: "bottom",
                    mirror: true,
                    color: FabricStyles.chartAxisColor,
                    tickfont: {
                        family: FabricStyles.fontFamilies,
                        size: 11,
                    },
                    showline: true,
                    showgrid: true,
                    gridcolor: "#e5e5e5",
                },
            } as any,
        };
        let rawX: number[];
        let rawY: number[];
        let yLabels: string[];
        let yLabelIndexes: number[];
        const yMeta = jointData.metaDict[chartProps.yAxis.property];
        const yAxisName = yMeta.label;
        if (chartProps.yAxis.property === Cohort.CohortKey) {
            rawX = [];
            rawY = [];
            yLabels = [];
            yLabelIndexes = [];
            cohorts.forEach((cohort, cohortIndex) => {
                const cohortXs = cohort.unwrap(
                    chartProps.xAxis.property,
                    chartProps.chartType === ChartTypes.Histogram,
                );
                const cohortY = new Array(cohortXs.length).fill(cohortIndex);
                rawX.push(...cohortXs);
                rawY.push(...cohortY);
                yLabels.push(cohort.name);
                yLabelIndexes.push(cohortIndex);
            });
        } else {
            const cohort = cohorts[selectedCohortIndex];
            rawY = cohort.unwrap(chartProps.yAxis.property, true);
            rawX = cohort.unwrap(chartProps.xAxis.property, chartProps.chartType === ChartTypes.Histogram);
            yLabels = yMeta.sortedCategoricalValues;
            yLabelIndexes = yLabels.map((_, index) => index);
        }

        // The bounding box for the labels on y axis are too small, add some white space as buffer
        yLabels = yLabels.map(val => {
            const len = val.length;
            let result = " ";
            for (let i = 0; i < len; i += 5) {
                result += " ";
            }
            return result + val;
        });
        plotlyProps.data[0].hoverinfo = "all";
        plotlyProps.data[0].orientation = "h";
        switch (chartProps.chartType) {
            case ChartTypes.Box: {
                // Uncomment to turn off tooltips on box plots
                // plotlyProps.layout.hovermode = false;
                plotlyProps.data[0].type = "box" as any;
                plotlyProps.data[0].x = rawX;
                plotlyProps.data[0].y = rawY;
                plotlyProps.data[0].marker = {
                    color: FabricStyles.fabricColorPalette[0],
                };
                _.set(plotlyProps, "layout.yaxis.ticktext", yLabels);
                _.set(plotlyProps, "layout.yaxis.tickvals", yLabelIndexes);
                break;
            }
            case ChartTypes.Histogram: {
                // for now, treat all bar charts as histograms, the issue with plotly implemented histogram is
                // it tries to bin the data passed to it(we'd like to apply the user specified bins.)
                // We also use the selected Y property as the series prop, since all histograms will just be a count.
                plotlyProps.data[0].type = "bar";
                const x = new Array(rawY.length).fill(1);
                plotlyProps.data[0].text = rawY.map(index => yLabels[index]);
                plotlyProps.data[0].hoverinfo = "all";
                plotlyProps.data[0].hovertemplate = ` ${yAxisName}:%{y}<br> ${localization.Charts.count}: %{x}<br>`;
                plotlyProps.data[0].y = rawY;
                plotlyProps.data[0].x = x;
                plotlyProps.data[0].marker = {};
                _.set(plotlyProps, "layout.yaxis.ticktext", yLabels);
                _.set(plotlyProps, "layout.yaxis.tickvals", yLabelIndexes);
                const styles = jointData.metaDict[chartProps.xAxis.property].sortedCategoricalValues.map(
                    (label, index) => {
                        return {
                            target: index,
                            value: {
                                name: label,
                                marker: {
                                    color: FabricStyles.fabricColorPalette[index],
                                },
                            },
                        };
                    },
                );
                const transforms: Partial<Transform>[] = [
                    {
                        type: "aggregate",
                        groups: rawY,
                        aggregations: [{ target: "x", func: "sum" }],
                    },
                    {
                        type: "groupby",
                        groups: rawX,
                        styles,
                    },
                ];
                plotlyProps.layout.showlegend = true;
                plotlyProps.data[0].transforms = transforms;
                break;
            }
            default:
        }
        return plotlyProps;
    }

    private generateMetrics(): ILabeledStatistic[][] {
        if (this.props.chartProps.yAxis.property === Cohort.CohortKey) {
            const indexes = this.props.cohorts.map(cohort => cohort.unwrap(JointDataset.IndexLabel));
            return generateMetrics(this.props.jointDataset, indexes, this.props.metadata.modelType);
        } else {
            const cohort = this.props.cohorts[this.state.selectedCohortIndex];
            const yValues = cohort.unwrap(this.props.chartProps.yAxis.property, true);
            const indexArray = cohort.unwrap(JointDataset.IndexLabel);
            const sortedCategoricalValues = this.props.jointDataset.metaDict[this.props.chartProps.yAxis.property]
                .sortedCategoricalValues;
            const indexes = sortedCategoricalValues.map((_, labelIndex) => {
                return indexArray.filter((_, index) => {
                    return yValues[index] === labelIndex;
                });
            });
            return generateMetrics(this.props.jointDataset, indexes, this.props.metadata.modelType);
        }
    }
}
