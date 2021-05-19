// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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
    }

    return (
      <ModelAssessmentDashboard
        {...modelData}
        requestPredictions={requestPredictionsMethod}
        requestDebugML={requestDebugMLMethod}
        requestMatrix={requestMatrixMethod}
        requestImportances={requestImportancesMethod}
        localUrl={config.baseUrl}
        locale={config.locale}
        theme={undefined}
      />
    );
  }
}
