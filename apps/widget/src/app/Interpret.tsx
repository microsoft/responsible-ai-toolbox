// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { NewExplanationDashboard } from "@responsible-ai/interpret";
import React from "react";

import { callFlaskService } from "./callFlaskService";
import { config } from "./config";
import { modelData } from "./modelData";
interface IInterpretProps {
  dashboardType?: "ModelPerformance";
}
export class Interpret extends React.Component<IInterpretProps> {
  public render(): React.ReactNode {
    let requestMethod = undefined;
    if (config.baseUrl !== undefined) {
      requestMethod = (request: any[]): Promise<any[]> => {
        return callFlaskService(request, "/predict");
      };
    }

    return (
      <NewExplanationDashboard
        dashboardType={this.props.dashboardType}
        modelInformation={{ modelClass: "blackbox" }}
        dataSummary={{
          classNames: modelData.classNames,
          featureNames: modelData.featureNames
        }}
        testData={modelData.trainingData}
        predictedY={modelData.predictedY}
        probabilityY={modelData.probabilityY}
        trueY={modelData.trueY}
        precomputedExplanations={{
          ebmGlobalExplanation: modelData.ebmData,
          globalFeatureImportance: modelData.globalExplanation,
          localFeatureImportance: modelData.localExplanations
        }}
        requestPredictions={requestMethod}
        locale={config.locale}
        explanationMethod={modelData.explanation_method}
        data_balance_measures={modelData.data_balance_measures}
        task_type={modelData.task_type}
        true_y={modelData.true_y}
        features={modelData.features}
        feature_names={modelData.feature_names}
        categorical_features={modelData.categorical_features}
      />
    );
  }
}
