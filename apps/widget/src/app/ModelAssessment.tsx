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
      | "requestDatasetAnalysisBarChart"
      | "requestDatasetAnalysisBoxChart"
      | "requestGlobalExplanations"
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
      callBack.requestGlobalExplanations = async (
        filter: unknown[],
        compositeFilter: unknown[],
        abortSignal: AbortSignal
      ): Promise<any> => {
        return callFlaskService(
          this.props.config,
          [filter, compositeFilter],
          "/global_explanations",
          abortSignal
        );
      };
      callBack.requestDatasetAnalysisBarChart = async (
        filter: unknown[],
        compositeFilter: unknown[],
        column_name_x: string,
        treat_column_x_as_categorical: boolean,
        column_name_y: string,
        treat_column_y_as_categorical: boolean,
        num_bins: number,
        abortSignal: AbortSignal
      ): Promise<any> => {
        return callFlaskService(
          this.props.config,
          [
            filter,
            compositeFilter,
            column_name_x,
            treat_column_x_as_categorical,
            column_name_y,
            treat_column_y_as_categorical,
            num_bins
          ],
          "/dataset_analysis_bar_chart_plot",
          abortSignal
        );
      };
      callBack.requestDatasetAnalysisBoxChart = async (
        filter: unknown[],
        compositeFilter: unknown[],
        column_name_x: string,
        column_name_y: string,
        num_bins: number,
        abortSignal: AbortSignal
      ): Promise<any> => {
        return callFlaskService(
          this.props.config,
          [filter, compositeFilter, column_name_x, column_name_y, num_bins],
          "/dataset_analysis_box_chart_plot",
          abortSignal
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
