// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICasualAnalysisSingleData,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { AccessibleChart, IPlotlyProperty } from "@responsible-ai/mlchartlib";
import _, { isEqual } from "lodash";
import { getTheme, Stack } from "office-ui-fabric-react";
import { Datum } from "plotly.js";
import React from "react";

import { basePlotlyProperties } from "./basePlotlyProperties";
import { CasualAggregateStyles } from "./CasualAggregateStyles";

export interface ICasualAggregateChartProps {
  data: ICasualAnalysisSingleData;
}

export class CasualAggregateChart extends React.PureComponent<ICasualAggregateChartProps> {
    public static contextType = ModelAssessmentContext;
    public context: React.ContextType<
      typeof ModelAssessmentContext
    > = defaultModelAssessmentContext;
  
    public render(): React.ReactNode {      
      const styles = CasualAggregateStyles();
      return (
        <Stack horizontal={true} verticalFill={true} className={styles.container}>
          <Stack.Item grow={true} className={styles.leftPane}>            
            <AccessibleChart plotlyProps={this.generateCasualAggregatePlotlyProps()} theme={getTheme()} />
          </Stack.Item>          
          <Stack.Item grow={true} className={styles.rightPane}>
            <Stack horizontal={false}>
              <Stack.Item className={styles.label}>
                <b>{localization.CasualAnalysis.AggregateView.continuous}</b>{localization.CasualAnalysis.AggregateView.continuousDescription} 
              </Stack.Item>
              <Stack.Item className={styles.label}>
                <b>{localization.CasualAnalysis.AggregateView.binary}</b>{localization.CasualAnalysis.AggregateView.binaryDescription} 
              </Stack.Item>
              <Stack.Item className={styles.lasso}>
                {localization.CasualAnalysis.AggregateView.lasso}                
              </Stack.Item>
            </Stack>         
          </Stack.Item>      
        </Stack>
      );
    }
  
    public componentDidUpdate(prevProps: ICasualAggregateChartProps): void {
      if (
        !isEqual(prevProps.data, this.props.data)
      ) {
        this.forceUpdate();
      }
    }
    private generateCasualAggregatePlotlyProps(): IPlotlyProperty {
        const plotlyProps = _.cloneDeep(basePlotlyProperties);
        plotlyProps.data = [
            {
            error_y: {
                array: this.props.data.pValue as unknown as Datum[],
                type: 'data',
                visible: true
            },
            mode: 'markers',
            type: 'scatter',
            x: this.props.data.name,
            y: this.props.data.point
            }
        ];
        return plotlyProps;
    }
  }