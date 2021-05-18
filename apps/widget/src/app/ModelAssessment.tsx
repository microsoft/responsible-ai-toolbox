// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IMetricRequest, IMetricResponse } from "@responsible-ai/core-ui";
import {
  ModelAssessmentDashboard,
  IModelAssessmentData
} from "@responsible-ai/model-assessment";
import React from "react";

import { callFlaskService } from "./callFlaskService";
import { config } from "./config";
import { modelData as modelDataImported } from "./modelData";

export class ModelAssessment extends React.Component {
  public render(): React.ReactNode {
    const modelData: IModelAssessmentData = modelDataImported;
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

    return (
      <ModelAssessmentDashboard
        {...modelData}
        requestPredictions={requestPredictionsMethod}
        requestDebugML={requestDebugMLMethod}
        requestMatrix={requestMatrixMethod}
        requestMetrics={requestMetricsMethod}
        requestImportances={requestImportancesMethod}
        localUrl={config.baseUrl}
        locale={config.locale}
        theme={undefined}
      />
    );
  }
}
