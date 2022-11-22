// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { NewExplanationDashboard } from "@responsible-ai/interpret";
import React from "react";

import { callFlaskService } from "./callFlaskService";
import { IAppConfig } from "./config";
interface IInterpretProps {
  dashboardType?: "ModelPerformance";
  config: IAppConfig;
  modelData: any;
}
export class Interpret extends React.Component<IInterpretProps> {
  public render(): React.ReactNode {
    let requestMethod = undefined;
    if (this.props.config.baseUrl) {
      requestMethod = (request: any[]): Promise<any[]> => {
        return callFlaskService(this.props.config, request, "/predict");
      };
    }

    return (
      <NewExplanationDashboard
        dashboardType={this.props.dashboardType}
        modelInformation={{ modelClass: "blackbox" }}
        dataSummary={{
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
        requestPredictions={requestMethod}
        locale={this.props.config.locale}
        explanationMethod={this.props.modelData.explanation_method}
      />
    );
  }
}
