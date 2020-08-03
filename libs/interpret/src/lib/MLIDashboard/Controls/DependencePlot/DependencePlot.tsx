import React from "react";
import { AccessibleChart, IPlotlyProperty, PlotlyMode } from "@responsible-ai/mlchartlib";
import { getTheme } from "@uifabric/styling";
import _ from "lodash";
import { Text } from "office-ui-fabric-react";
import { IGenericChartProps } from "../../NewExplanationDashboard";
import { JointDataset } from "../../JointDataset";
import { IExplanationModelMetadata, ModelTypes } from "../../IExplanationContext";
import { localization } from "../../../Localization/localization";
import { Cohort } from "../../Cohort";
import { FabricStyles } from "../../FabricStyles";
import { WeightVectorOption } from "../../IWeightedDropdownContext";
import { dependencePlotStyles } from "./DependencePlot.styles";

export interface IDependecePlotProps {
    chartProps: IGenericChartProps;
    jointDataset: JointDataset;
    cohort: Cohort;
    cohortIndex: number;
    metadata: IExplanationModelMetadata;
    selectedWeight: WeightVectorOption;
    selectedWeightLabel: string;
    onChange: (props: IGenericChartProps) => void;
}

export class DependencePlot extends React.PureComponent<IDependecePlotProps> {
    public static basePlotlyProperties: IPlotlyProperty = {
        config: { displaylogo: false, responsive: true, displayModeBar: false },
        data: [{}],
        layout: {
            dragmode: false,
            autosize: true,
            font: {
                size: 10,
            },
            margin: {
                t: 10,
                l: 10,
                b: 20,
                r: 10,
            },
            hovermode: "closest",
            showlegend: false,
            yaxis: {
                automargin: true,
                color: FabricStyles.chartAxisColor,
                tickfont: {
                    family: "Roboto, Helvetica Neue, sans-serif",
                    size: 11,
                },
                zeroline: true,
                showgrid: true,
                gridcolor: "#e5e5e5",
            },
            xaxis: {
                automargin: true,
                color: FabricStyles.chartAxisColor,
                tickfont: {
                    family: "Roboto, Helvetica Neue, sans-serif",
                    size: 11,
                },
                zeroline: true,
                showgrid: true,
                gridcolor: "#e5e5e5",
            },
        } as any,
    };

    public render(): React.ReactNode {
        const classNames = dependencePlotStyles();
        if (this.props.chartProps === undefined) {
            return (
                <div className={classNames.secondaryChartPlacolderBox}>
                    <div className={classNames.secondaryChartPlacolderSpacer}>
                        <Text variant="large" className={classNames.faintText}>
                            {localization.DependencePlot.placeholder}
                        </Text>
                    </div>
                </div>
            );
        }
        const plotlyProps = this.generatePlotlyProps();
        const yAxisLabel =
            this.props.metadata.modelType === ModelTypes.regression
                ? this.props.jointDataset.metaDict[this.props.chartProps.xAxis.property].label
                : this.props.jointDataset.metaDict[this.props.chartProps.xAxis.property].label +
                  " : " +
                  this.props.selectedWeightLabel;
        return (
            <div className={classNames.DependencePlot}>
                <div className={classNames.chartWithAxes}>
                    <div className={classNames.chartWithVertical}>
                        <div className={classNames.verticalAxis}>
                            <div className={classNames.rotatedVerticalBox}>
                                <Text variant={"medium"} block>
                                    {localization.DependencePlot.featureImportanceOf}
                                </Text>
                                <Text variant={"medium"}>{yAxisLabel}</Text>
                            </div>
                        </div>
                        <div className={classNames.chart}>
                            <AccessibleChart plotlyProps={plotlyProps} theme={getTheme() as any} />
                        </div>
                    </div>
                    <div className={classNames.horizontalAxisWithPadding}>
                        <div className={classNames.paddingDiv}></div>
                        <div className={classNames.horizontalAxis}>
                            <Text variant={"medium"}>
                                {this.props.jointDataset.metaDict[this.props.chartProps.xAxis.property].label}
                            </Text>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private generatePlotlyProps(): IPlotlyProperty {
        const plotlyProps = _.cloneDeep(DependencePlot.basePlotlyProperties);
        const jointData = this.props.jointDataset;
        const cohort = this.props.cohort;
        plotlyProps.data[0].hoverinfo = "all";
        let hovertemplate = "";
        if (
            this.props.chartProps.colorAxis &&
            (this.props.chartProps.colorAxis.options.bin ||
                jointData.metaDict[this.props.chartProps.colorAxis.property].treatAsCategorical)
        ) {
            cohort.sort(this.props.chartProps.colorAxis.property);
        }
        const customdata = cohort.unwrap(JointDataset.IndexLabel).map(val => {
            const dict = {};
            dict[JointDataset.IndexLabel] = val;
            return dict;
        });
        plotlyProps.data[0].type = this.props.chartProps.chartType;
        plotlyProps.data[0].mode = PlotlyMode.markers;
        plotlyProps.data[0].marker = { color: FabricStyles.fabricColorPalette[this.props.cohortIndex] };
        if (this.props.chartProps.xAxis) {
            if (jointData.metaDict[this.props.chartProps.xAxis.property].treatAsCategorical) {
                const xLabels = jointData.metaDict[this.props.chartProps.xAxis.property].sortedCategoricalValues;
                const xLabelIndexes = xLabels.map((_, index) => index);
                _.set(plotlyProps, "layout.xaxis.ticktext", xLabels);
                _.set(plotlyProps, "layout.xaxis.tickvals", xLabelIndexes);
            }
            const rawX = cohort.unwrap(this.props.chartProps.xAxis.property);
            const xLabel = jointData.metaDict[this.props.chartProps.xAxis.property].label;
            if (this.props.chartProps.xAxis.options.dither) {
                const dithered = cohort.unwrap(JointDataset.DitherLabel);
                plotlyProps.data[0].x = dithered.map((dither, index) => {
                    return rawX[index] + dither;
                });
                hovertemplate += xLabel + ": %{customdata.X}<br>";
                rawX.forEach((val, index) => {
                    // If categorical, show string value in tooltip
                    if (jointData.metaDict[this.props.chartProps.xAxis.property].treatAsCategorical) {
                        customdata[index]["X"] =
                            jointData.metaDict[this.props.chartProps.xAxis.property].sortedCategoricalValues[val];
                    } else {
                        customdata[index]["X"] = val;
                    }
                });
            } else {
                plotlyProps.data[0].x = rawX;
                hovertemplate += xLabel + ": %{x}<br>";
            }
        }
        if (this.props.chartProps.yAxis) {
            if (jointData.metaDict[this.props.chartProps.yAxis.property].treatAsCategorical) {
                const yLabels = jointData.metaDict[this.props.chartProps.yAxis.property].sortedCategoricalValues;
                const yLabelIndexes = yLabels.map((_, index) => index);
                _.set(plotlyProps, "layout.yaxis.ticktext", yLabels);
                _.set(plotlyProps, "layout.yaxis.tickvals", yLabelIndexes);
            }
            const rawY: number[] = cohort.unwrap(this.props.chartProps.yAxis.property);
            const yLabel = localization.Charts.featureImportance;
            plotlyProps.data[0].y = rawY;
            rawY.forEach((val, index) => {
                customdata[index]["Yformatted"] = val.toLocaleString(undefined, { maximumFractionDigits: 3 });
            });
            hovertemplate += yLabel + ": %{customdata.Yformatted}<br>";
        }
        const indecies = cohort.unwrap(JointDataset.IndexLabel, false);
        indecies.forEach((absoluteIndex, i) => {
            customdata[i]["AbsoluteIndex"] = absoluteIndex;
        });
        hovertemplate += localization.Charts.rowIndex + ": %{customdata.AbsoluteIndex}<br>";
        hovertemplate += "<extra></extra>";
        plotlyProps.data[0].customdata = customdata as any;
        plotlyProps.data[0].hovertemplate = hovertemplate;
        return plotlyProps;
    }
}
