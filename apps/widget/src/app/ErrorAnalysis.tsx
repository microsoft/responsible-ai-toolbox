// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IErrorAnalysisMatrix } from "@responsible-ai/core-ui";
import { ErrorAnalysisDashboard } from "@responsible-ai/error-analysis";
import React from "react";

import { callFlaskService } from "./callFlaskService";
import { IAppConfig } from "./config";

interface IErrorAnalysisProps {
  config: IAppConfig;
  modelData: any;
}
export class ErrorAnalysis extends React.Component<IErrorAnalysisProps> {
  public render(): React.ReactNode {
    let requestPredictionsMethod = undefined;
    let requestMatrixMethod = undefined;
    let requestDebugMLMethod = undefined;
    let requestImportancesMethod = undefined;
    if (this.props.config.baseUrl) {
      if (this.props.modelData.enablePredict) {
        requestPredictionsMethod = async (data: any[]): Promise<any[]> => {
          return callFlaskService(this.props.config, data, "/predict");
        };
      }
      requestMatrixMethod = async (
        data: any[]
      ): Promise<IErrorAnalysisMatrix> => {
        return callFlaskService(this.props.config, data, "/matrix");
      };
      requestDebugMLMethod = async (data: any[]): Promise<any[]> => {
        return callFlaskService(this.props.config, data, "/tree");
      };
      requestImportancesMethod = async (data: any[]): Promise<any[]> => {
        return callFlaskService(this.props.config, data, "/importances");
      };
    }

    return (
      <ErrorAnalysisDashboard
        modelInformation={{
          method: this.props.modelData.method,
          modelClass: "blackbox"
        }}
        dataSummary={{
          categoricalMap: this.props.modelData.categoricalMap,
          classNames: this.props.modelData.classNames,
          featureNames: this.props.modelData.featureNames
        }}
        testData={this.props.modelData.trainingData}
        predictedY={this.props.modelData.predictedY}
        probabilityY={this.props.modelData.probabilityY}
        trueY={this.props.modelData.trueY}
        precomputedExplanations={{
          ebmGlobalExplanation: this.props.modelData.ebmData,
          globalFeatureImportance: this.props.modelData.globalExplanation,
          localFeatureImportance: this.props.modelData.localExplanations
        }}
        requestPredictions={requestPredictionsMethod}
        requestDebugML={requestDebugMLMethod}
        requestMatrix={requestMatrixMethod}
        requestImportances={requestImportancesMethod}
        localUrl={this.props.config.baseUrl}
        locale={this.props.config.locale}
        features={this.props.modelData.featureNames}
        errorAnalysisData={this.props.modelData.errorAnalysisData}
      />
    );
  }
}
