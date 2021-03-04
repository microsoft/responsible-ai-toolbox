// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ModelAssessmentDashboard } from "@responsible-ai/model-assessment";
import {
  IDataset,
  IMetricRequest,
  IMetricResponse,
  IModelExplanationData
} from "@responsible-ai/core-ui";
import React from "react";

import { callFlaskService } from "./callFlaskService";
import { config } from "./config";
import { modelData } from "./modelData";

export class ModelAssessment extends React.Component {
  public render(): React.ReactNode {
    let requestPredictionsMethod = undefined;
    let requestMatrixMethod = undefined;
    let requestDebugMLMethod = undefined;
    let requestImportancesMethod = undefined;
    let requestMetricsMethod = undefined;
    if (config.baseUrl !== undefined) {
      requestPredictionsMethod = async (data: any[]): Promise<any[]> => {
        return callFlaskService(data, "/predict");
      };
      requestMatrixMethod = async (data: any[]): Promise<any[]> => {
        return callFlaskService(data, "/matrix");
      };
      requestDebugMLMethod = async (data: any[]): Promise<any[]> => {
        return callFlaskService(data, "/tree");
      };
      requestImportancesMethod = async (data: any[]): Promise<any[]> => {
        return callFlaskService(data, "/importances");
      };
      requestMetricsMethod = async (
        data: IMetricRequest
      ): Promise<IMetricResponse> => {
        return callFlaskService(data, "/metrics") as Promise<IMetricResponse>;
      };
    }

    const dataset: IDataset = {
      categoricalMap: modelData.categoricalMap,
      classNames: modelData.classNames,
      featureNames: modelData.featureNames,
      features: modelData.features,
      sensitiveFeatures: modelData.sensitiveFeatures,
      trueY: modelData.trueY
    };

    const modelExplanationData: IModelExplanationData = {
      modelClass: "modelClass" in modelData ? modelData.modelClass : "blackbox",
      predictedY: modelData.predictedY,
      probabilityY: modelData.probabilityY,
      precomputedExplanations: {
        ebmGlobalExplanation: modelData.ebmData,
        globalFeatureImportance: modelData.globalExplanation,
        localFeatureImportance: modelData.localExplanations
      }
    };

    return (
      <ModelAssessmentDashboard
        dataset={dataset}
        modelExplanationData={modelExplanationData}
        requestPredictions={requestPredictionsMethod}
        requestDebugML={requestDebugMLMethod}
        requestMatrix={requestMatrixMethod}
        requestMetrics={requestMetricsMethod}
        requestImportances={requestImportancesMethod}
        localUrl={modelData.localUrl}
        locale={modelData.locale}
        theme={modelData.theme}
        supportedBinaryClassificationPerformanceKeys={
          modelData.classification_methods
        }
        supportedRegressionPerformanceKeys={modelData.regression_methods}
        supportedProbabilityPerformanceKeys={modelData.probability_methods}
      />
    );
  }
}
