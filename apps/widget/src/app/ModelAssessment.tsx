// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ICausalWhatIfData,
  IErrorAnalysisMatrix,
  IHighchartBoxData
} from "@responsible-ai/core-ui";
import {
  ModelAssessmentDashboard,
  IModelAssessmentData,
  IModelAssessmentDashboardProps,
  parseFeatureFlights
} from "@responsible-ai/model-assessment";
import React from "react";

import { callFlaskService } from "./callFlaskService";
import { IAppConfig } from "./config";

interface IModelAssessmentProps {
  config: IAppConfig;
  modelData: IModelAssessmentData;
}
export class ModelAssessment extends React.Component<IModelAssessmentProps> {
  public render(): React.ReactNode {
    const callBack: Pick<
      IModelAssessmentDashboardProps,
      | "requestExp"
      | "requestPredictions"
      | "requestDebugML"
      | "requestMatrix"
      | "requestImportances"
      | "requestCausalWhatIf"
      | "requestBoxPlotDistribution"
      | "requestBubblePlotData"
    > = {};
    if (this.props.config.baseUrl) {
      callBack.requestExp = async (data: number): Promise<any[]> => {
        return callFlaskService(this.props.config, data, "/get_exp");
      };
      callBack.requestPredictions = async (data: any[]): Promise<any[]> => {
        return callFlaskService(this.props.config, data, "/predict");
      };
      callBack.requestMatrix = async (
        data: any[]
      ): Promise<IErrorAnalysisMatrix> => {
        return callFlaskService(this.props.config, data, "/matrix");
      };
      callBack.requestDebugML = async (data: any[]): Promise<any[]> => {
        return callFlaskService(this.props.config, data, "/tree");
      };
      callBack.requestImportances = async (data: any[]): Promise<any[]> => {
        return callFlaskService(this.props.config, data, "/importances");
      };
      callBack.requestCausalWhatIf = async (
        id: string,
        features: unknown[],
        featureName: string,
        newValue: unknown[],
        target: unknown[],
        abortSignal: AbortSignal
      ): Promise<ICausalWhatIfData[]> => {
        return callFlaskService(
          this.props.config,
          [id, features, featureName, newValue, target],
          "/causal_whatif",
          abortSignal
        );
      };
      callBack.requestBoxPlotDistribution = async (
        data: any
      ): Promise<IHighchartBoxData> => {
        return callFlaskService(
          this.props.config,
          data,
          "/model_overview_probability_distribution"
        );
      };
      callBack.requestBubblePlotData = async (
        data: any
      ): Promise<IHighchartBoxData> => {
        return callFlaskService(
          this.props.config,
          data,
          "/dataset_analysis_bubble_chart_plot"
        );
      };
    }

    return (
      <ModelAssessmentDashboard
        {...this.props.modelData}
        {...callBack}
        localUrl={this.props.config.baseUrl}
        locale={this.props.config.locale}
        theme={undefined}
        featureFlights={parseFeatureFlights(this.props.config.featureFlights)}
      />
    );
  }
}
