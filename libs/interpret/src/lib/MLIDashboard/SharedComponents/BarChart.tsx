import { IExplanationModelMetadata, ModelTypes } from "../IExplanationContext";
import React from "react";
import { localization } from "../../Localization/localization";
import Plotly from "plotly.js-dist";
import { v4 } from "uuid";
import { IPlotlyProperty, PlotlyThemes } from "@responsible-ai/mlchartlib";
import { ModelExplanationUtils } from "../ModelExplanationUtils";
import _ from "lodash";

export interface IBarChartProps {
    featureByClassMatrix: number[][];
    sortedIndexVector: number[];
    topK: number;
    intercept?: number[];
    modelMetadata: IExplanationModelMetadata;
    additionalRowData?: number[];
    barmode: "stack" | "group";
    defaultVisibleClasses?: number[];
    theme?: string;
}

export class BarChart extends React.PureComponent<IBarChartProps> {
    private guid: string = v4();

    private static buildTextArray(
        sortedIndexVector: number[],
        importanceVector: number[],
        featureNames: string[],
        className?: string,
        rowDataArray?: Array<string | number>,
    ): string[] {
        return sortedIndexVector.map(index => {
            const result = [];
            result.push(
                localization.formatString(
                    localization.AggregateImportance.featureLabel,
                    featureNames[index] || "unknown feature",
                ),
            );
            result.push(
                localization.formatString(
                    localization.AggregateImportance.importanceLabel,
                    importanceVector[index].toLocaleString(undefined, { minimumFractionDigits: 3 }),
                ),
            );
            if (rowDataArray && rowDataArray.length > index) {
                result.push(
                    localization.formatString(localization.AggregateImportance.valueLabel, rowDataArray[index]),
                );
            }
            if (className) {
                result.push(localization.formatString(localization.BarChart.classLabel, className));
            }
            return result.join("<br>");
        });
    }

    private static buildInterceptTooltip(value: number, className?: string): string {
        const result = [];
        result.push(localization.intercept);
        result.push(
            localization.formatString(
                localization.AggregateImportance.importanceLabel,
                value.toLocaleString(undefined, { minimumFractionDigits: 3 }),
            ),
        );
        if (className) {
            result.push(localization.formatString(localization.BarChart.classLabel, className));
        }
        return result.join("<br>");
    }

    public render(): React.ReactNode {
        if (this.hasData()) {
            const plotlyProps = this.buildPlotlyProps();
            const themedProps = this.props.theme ? PlotlyThemes.applyTheme(plotlyProps, this.props.theme) : plotlyProps;
            window.setTimeout(async () => {
                await Plotly.react(this.guid, themedProps.data, themedProps.layout, themedProps.config);
            }, 0);
            return <div className="feature-importance-bar-chart" id={this.guid} />;
        }
        return <div className="centered">{localization.BarChart.noData}</div>;
    }

    private hasData(): boolean {
        return this.props.featureByClassMatrix.length > 0;
    }

    private buildPlotlyProps(): IPlotlyProperty {
        const classByFeatureMatrix = ModelExplanationUtils.transpose2DArray(this.props.featureByClassMatrix);
        const sortedIndexVector = this.props.sortedIndexVector.slice(-1 * this.props.topK).reverse();
        const baseSeries = {
            config: { displaylogo: false, responsive: true, displayModeBar: false } as Plotly.Config,
            data: [],
            layout: {
                autosize: true,
                dragmode: false,
                barmode: this.props.barmode,
                font: {
                    size: 10,
                },
                margin: { t: 10, r: 10, b: 30 },
                hovermode: "closest",
                xaxis: {
                    automargin: true,
                },
                yaxis: {
                    automargin: true,
                    title: localization.featureImportance,
                },
                showlegend: classByFeatureMatrix.length > 1,
            } as any,
        };

        if (classByFeatureMatrix.length > 0) {
            classByFeatureMatrix.forEach((singleSeries, classIndex) => {
                const visible =
                    this.props.defaultVisibleClasses !== undefined &&
                    this.props.defaultVisibleClasses.indexOf(classIndex) === -1
                        ? "legendonly"
                        : true;
                const x = sortedIndexVector.map((_, index) => index);
                const y = sortedIndexVector.map(index => singleSeries[index]);
                const text = BarChart.buildTextArray(
                    sortedIndexVector,
                    singleSeries,
                    this.props.modelMetadata.featureNames,
                    this.props.modelMetadata.modelType === ModelTypes.multiclass
                        ? this.props.modelMetadata.classNames[classIndex]
                        : undefined,
                    this.props.additionalRowData,
                );
                if (this.props.intercept) {
                    x.unshift(-1);
                    y.unshift(this.props.intercept[classIndex]);
                    text.unshift(
                        BarChart.buildInterceptTooltip(
                            this.props.intercept[classIndex],
                            this.props.modelMetadata.modelType === ModelTypes.multiclass
                                ? this.props.modelMetadata.classNames[classIndex]
                                : undefined,
                        ),
                    );
                }

                const orientation = "v";
                baseSeries.data.push({
                    hoverinfo: "text",
                    orientation,
                    type: "bar",
                    visible,
                    name:
                        this.props.modelMetadata.modelType === ModelTypes.multiclass
                            ? this.props.modelMetadata.classNames[classIndex]
                            : "",
                    x,
                    y,
                    text: text,
                } as any);
            });
        }
        const ticktext = sortedIndexVector.map(i => this.props.modelMetadata.featureNamesAbridged[i]);
        const tickvals = sortedIndexVector.map((_, index) => index);
        if (this.props.intercept) {
            ticktext.unshift(localization.intercept);
            tickvals.unshift(-1);
        }
        _.set(baseSeries, "layout.xaxis.ticktext", ticktext);
        _.set(baseSeries, "layout.xaxis.tickvals", tickvals);
        return baseSeries;
    }
}
