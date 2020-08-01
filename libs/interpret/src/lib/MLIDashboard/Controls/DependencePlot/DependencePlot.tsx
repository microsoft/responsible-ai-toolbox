import { ComboBox, IComboBox, IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import * as Plotly from 'plotly.js-dist';
import React from 'react';
import { AccessibleChart, IPlotlyProperty, DefaultSelectionFunctions, PlotlyMode } from 'mlchartlib';
import { mergeStyleSets, getTheme } from '@uifabric/styling';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { IconButton, Button, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Transform } from 'plotly.js-dist';
import { IGenericChartProps, ISelectorConfig, ChartTypes } from '../../NewExplanationDashboard';
import { JointDataset, ColumnCategories } from '../../JointDataset';
import { IExplanationModelMetadata, ModelTypes } from '../../IExplanationContext';
import { AxisConfigDialog } from '../AxisConfigurationDialog/AxisConfigDialog';
import { localization } from '../../../Localization/localization';
import _ from 'lodash';
import { Cohort } from '../../Cohort';
import { Text } from 'office-ui-fabric-react';
import { FabricStyles } from '../../FabricStyles';
import { dependencePlotStyles } from './DependencePlot.styles';
import { WeightVectorOption } from '../../IWeightedDropdownContext';

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
            hovermode: 'closest',
            showlegend: false,
            yaxis: {
                automargin: true,
                color: FabricStyles.chartAxisColor,
                tickfont: {
                    family: 'Roboto, Helvetica Neue, sans-serif',
                    size: 11,
                },
                zeroline: true,
                showgrid: true,
                gridcolor: '#e5e5e5',
            },
            xaxis: {
                automargin: true,
                color: FabricStyles.chartAxisColor,
                tickfont: {
                    family: 'Roboto, Helvetica Neue, sans-serif',
                    size: 11,
                },
                zeroline: true,
                showgrid: true,
                gridcolor: '#e5e5e5',
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
                  ' : ' +
                  this.props.selectedWeightLabel;
        return (
            <div className={classNames.DependencePlot}>
                <div className={classNames.chartWithAxes}>
                    <div className={classNames.chartWithVertical}>
                        <div className={classNames.verticalAxis}>
                            <div className={classNames.rotatedVerticalBox}>
                                <Text variant={'medium'} block>
                                    {localization.DependencePlot.featureImportanceOf}
                                </Text>
                                <Text variant={'medium'}>{yAxisLabel}</Text>
                            </div>
                        </div>
                        <div className={classNames.chart}>
                            <AccessibleChart plotlyProps={plotlyProps} theme={getTheme() as any} />
                        </div>
                    </div>
                    <div className={classNames.horizontalAxisWithPadding}>
                        <div className={classNames.paddingDiv}></div>
                        <div className={classNames.horizontalAxis}>
                            <Text variant={'medium'}>
                                {this.props.jointDataset.metaDict[this.props.chartProps.xAxis.property].label}
                            </Text>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private onXSet(value: ISelectorConfig): void {
        const newProps = _.cloneDeep(this.props.chartProps);
        newProps.xAxis = value;
        const propMeta = this.props.jointDataset.metaDict[value.property];
        newProps.yAxis = {
            property: JointDataset.ReducedLocalImportanceRoot + propMeta.index,
            options: {},
        };
        this.props.onChange(newProps);
        this.setState({ xDialogOpen: false });
    }

    private onColorSet(value: ISelectorConfig): void {
        const newProps = _.cloneDeep(this.props.chartProps);
        newProps.colorAxis = value;
        this.props.onChange(newProps);
        this.setState({ colorDialogOpen: false });
    }

    private generatePlotlyProps(): IPlotlyProperty {
        const plotlyProps = _.cloneDeep(DependencePlot.basePlotlyProperties);
        const jointData = this.props.jointDataset;
        const cohort = this.props.cohort;
        plotlyProps.data[0].hoverinfo = 'all';
        let hovertemplate = '';
        if (
            this.props.chartProps.colorAxis &&
            (this.props.chartProps.colorAxis.options.bin ||
                jointData.metaDict[this.props.chartProps.colorAxis.property].treatAsCategorical)
        ) {
            cohort.sort(this.props.chartProps.colorAxis.property);
        }
        const customdata = cohort.unwrap(JointDataset.IndexLabel).map((val) => {
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
                const xLabelIndexes = xLabels.map((unused, index) => index);
                _.set(plotlyProps, 'layout.xaxis.ticktext', xLabels);
                _.set(plotlyProps, 'layout.xaxis.tickvals', xLabelIndexes);
            }
            const rawX = cohort.unwrap(this.props.chartProps.xAxis.property);
            const xLabel = jointData.metaDict[this.props.chartProps.xAxis.property].label;
            if (this.props.chartProps.xAxis.options.dither) {
                const dithered = cohort.unwrap(JointDataset.DitherLabel);
                plotlyProps.data[0].x = dithered.map((dither, index) => {
                    return rawX[index] + dither;
                });
                hovertemplate += xLabel + ': %{customdata.X}<br>';
                rawX.forEach((val, index) => {
                    // If categorical, show string value in tooltip
                    if (jointData.metaDict[this.props.chartProps.xAxis.property].treatAsCategorical) {
                        customdata[index]['X'] =
                            jointData.metaDict[this.props.chartProps.xAxis.property].sortedCategoricalValues[val];
                    } else {
                        customdata[index]['X'] = val;
                    }
                });
            } else {
                plotlyProps.data[0].x = rawX;
                hovertemplate += xLabel + ': %{x}<br>';
            }
        }
        if (this.props.chartProps.yAxis) {
            if (jointData.metaDict[this.props.chartProps.yAxis.property].treatAsCategorical) {
                const yLabels = jointData.metaDict[this.props.chartProps.yAxis.property].sortedCategoricalValues;
                const yLabelIndexes = yLabels.map((unused, index) => index);
                _.set(plotlyProps, 'layout.yaxis.ticktext', yLabels);
                _.set(plotlyProps, 'layout.yaxis.tickvals', yLabelIndexes);
            }
            const rawY: number[] = cohort.unwrap(this.props.chartProps.yAxis.property);
            const yLabel = localization.Charts.featureImportance;
            plotlyProps.data[0].y = rawY;
            rawY.forEach((val, index) => {
                customdata[index]['Yformatted'] = val.toLocaleString(undefined, { maximumFractionDigits: 3 });
            });
            hovertemplate += yLabel + ': %{customdata.Yformatted}<br>';
        }
        const indecies = cohort.unwrap(JointDataset.IndexLabel, false);
        indecies.forEach((absoluteIndex, i) => {
            customdata[i]['AbsoluteIndex'] = absoluteIndex;
        });
        hovertemplate += localization.Charts.rowIndex + ': %{customdata.AbsoluteIndex}<br>';
        hovertemplate += '<extra></extra>';
        plotlyProps.data[0].customdata = customdata as any;
        plotlyProps.data[0].hovertemplate = hovertemplate;
        return plotlyProps;
    }

    private scatterSelection(guid: string, selections: string[], plotlyProps: IPlotlyProperty): void {
        const selectedPoints =
            selections.length === 0
                ? null
                : plotlyProps.data.map((trace) => {
                      const selectedIndexes: number[] = [];
                      if ((trace as any).customdata) {
                          ((trace as any).customdata as any[]).forEach((dict, index) => {
                              if (selections.indexOf(dict[JointDataset.IndexLabel]) !== -1) {
                                  selectedIndexes.push(index);
                              }
                          });
                      }
                      return selectedIndexes;
                  });
        Plotly.restyle(guid, 'selectedpoints' as any, selectedPoints as any);
        const newLineWidths =
            selections.length === 0
                ? [0]
                : plotlyProps.data.map((trace) => {
                      if ((trace as any).customdata) {
                          const customData = (trace as any).customdata as string[];
                          const newWidths: number[] = new Array(customData.length).fill(0);
                          customData.forEach((id, index) => {
                              if (selections.indexOf(id) !== -1) {
                                  newWidths[index] = 2;
                              }
                          });
                          return newWidths;
                      }
                      return [0];
                  });
        Plotly.restyle(guid, 'marker.line.width' as any, newLineWidths as any);
    }
}
