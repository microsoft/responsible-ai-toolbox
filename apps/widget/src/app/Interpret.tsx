// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { NewExplanationDashboard } from "@responsible-ai/interpret";
import React from "react";

import { config } from "./config";
import { FlaskCommunication } from "./FlaskCommunication";
import { modelData } from "./modelData";
interface IInterpretProps {
  dashboardType?: "ModelPerformance";
}
export class Interpret extends React.Component<IInterpretProps> {
  public render(): React.ReactNode {
    let requestMethod = undefined;
    if (config.baseUrl !== undefined) {
      requestMethod = (request: any[]): Promise<any[]> => {
        return FlaskCommunication.callFlaskService(request, "/predict");
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
        locale={modelData.locale}
        explanationMethod={modelData.explanation_method}
      />
    );
  }
}
