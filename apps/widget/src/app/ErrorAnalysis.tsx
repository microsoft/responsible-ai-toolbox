// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IErrorAnalysisMatrix } from "@responsible-ai/core-ui";
import { ErrorAnalysisDashboard } from "@responsible-ai/error-analysis";
import React from "react";

import { callFlaskService } from "./callFlaskService";
import { config } from "./config";
import { modelData } from "./modelData";

export class ErrorAnalysis extends React.Component {
  public render(): React.ReactNode {
    let requestPredictionsMethod = undefined;
    let requestMatrixMethod = undefined;
    let requestDebugMLMethod = undefined;
    let requestImportancesMethod = undefined;
    if (config.baseUrl !== undefined) {
      if (modelData.enablePredict) {
        requestPredictionsMethod = async (data: any[]): Promise<any[]> => {
          return callFlaskService(data, "/predict");
        };
      }
      requestMatrixMethod = async (
        data: any[]
      ): Promise<IErrorAnalysisMatrix> => {
        return callFlaskService(data, "/matrix");
      };
      requestDebugMLMethod = async (data: any[]): Promise<any[]> => {
        return callFlaskService(data, "/tree");
      };
      requestImportancesMethod = async (data: any[]): Promise<any[]> => {
        return callFlaskService(data, "/importances");
      };
    }

    return (
      <ErrorAnalysisDashboard
        modelInformation={{ modelClass: "blackbox" }}
        dataSummary={{
          categoricalMap: modelData.categoricalMap,
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
        requestPredictions={requestPredictionsMethod}
        requestDebugML={requestDebugMLMethod}
        requestMatrix={requestMatrixMethod}
        requestImportances={requestImportancesMethod}
        localUrl={config.baseUrl}
        locale={config.locale}
        features={modelData.featureNames}
        rootStats={modelData.rootStats}
      />
    );
  }
}
