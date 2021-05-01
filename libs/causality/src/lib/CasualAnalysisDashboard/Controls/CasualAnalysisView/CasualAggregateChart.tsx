// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    defaultModelAssessmentContext,
  ICasualAnalysisData,
    ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { AccessibleChart, IPlotlyProperty } from "@responsible-ai/mlchartlib";
import _, { isEqual } from "lodash";
import { getTheme, Stack } from "office-ui-fabric-react";
import React from "react";

import { basePlotlyProperties } from "../../basePlotlyProperties";
import { CasualChartStyles } from "../../CasualChartStyles";

export interface ICasualAggregateChartProps {
  data: ICasualAnalysisData;
}

export class CasualAggregateChart extends React.PureComponent<ICasualAggregateChartProps> {
    public static contextType = ModelAssessmentContext;
    public context: React.ContextType<
      typeof ModelAssessmentContext
    > = defaultModelAssessmentContext;
  
    public render(): React.ReactNode {      
      const styles = CasualChartStyles();
      return (
        <Stack horizontal={true} verticalFill={true} className={styles.container}>
          <Stack.Item grow={false} shrink={false} className={styles.leftPane}>
            <Stack horizontal={false}>
              <Stack.Item>
                <Stack horizontal className={styles.description}>
                  <Stack.Item className={styles.header}>
                    <div>{localization.CasualAnalysis.MainMenu.title}</div>
                  </Stack.Item>
                  <Stack.Item className={styles.whyMust}>
                    <div className={styles.infoButton}>i</div>
                    {localization.CasualAnalysis.MainMenu.whyMust}
                  </Stack.Item>
                </Stack>
              </Stack.Item>
              <Stack.Item>
                <AccessibleChart plotlyProps={this.generateCasualAggregatePlotlyProps()} theme={getTheme()} />
              </Stack.Item>   
            </Stack> 
          </Stack.Item> 
          {/* <Stack.Item grow={true} className={styles.rightPane}>            
            {localization.CasualAnalysis.MainMenu.lasso}
          </Stack.Item>       */}
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
                array: this.props.data.pValue,
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