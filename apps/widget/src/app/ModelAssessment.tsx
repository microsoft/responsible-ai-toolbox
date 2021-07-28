// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ICausalWhatIfData,
  IErrorAnalysisMatrix
} from "@responsible-ai/core-ui";
import {
  ModelAssessmentDashboard,
  IModelAssessmentData,
  IModelAssessmentDashboardProps
} from "@responsible-ai/model-assessment";
import React from "react";

import { callFlaskService } from "./callFlaskService";
import { config } from "./config";
import { modelData as modelDataImported } from "./modelData";

export class ModelAssessment extends React.Component {
  public render(): React.ReactNode {
    const modelData: IModelAssessmentData = modelDataImported;
    const callBack: Pick<
      IModelAssessmentDashboardProps,
      | "requestPredictions"
      | "requestDebugML"
      | "requestMatrix"
      | "requestImportances"
      | "requestCausalWhatIf"
    > = {};
    if (config.baseUrl !== undefined) {
      callBack.requestPredictions = async (data: any[]): Promise<any[]> => {
        return callFlaskService(data, "/predict");
      };
      callBack.requestMatrix = async (
        data: any[]
      ): Promise<IErrorAnalysisMatrix> => {
        return callFlaskService(data, "/matrix");
      };
      callBack.requestDebugML = async (data: any[]): Promise<any[]> => {
        return callFlaskService(data, "/tree");
      };
      callBack.requestImportances = async (data: any[]): Promise<any[]> => {
        return callFlaskService(data, "/importances");
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
          [id, features, featureName, newValue, target],
          "/causal_whatif",
          abortSignal
        );
      };
    }

    return (
      <ModelAssessmentDashboard
        {...modelData}
        {...callBack}
        localUrl={config.baseUrl}
        locale={config.locale}
        theme={undefined}
      />
    );
  }
}
