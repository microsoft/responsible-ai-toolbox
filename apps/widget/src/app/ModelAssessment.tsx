// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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
      callBack.requestMatrix = async (data: any[]): Promise<any[]> => {
        return callFlaskService(data, "/matrix");
      };
      callBack.requestDebugML = async (data: any[]): Promise<any[]> => {
        return callFlaskService(data, "/tree");
      };
      callBack.requestImportances = async (data: any[]): Promise<any[]> => {
        return callFlaskService(data, "/importances");
      };
      callBack.requestCausalWhatIf = async (
        ...args: [string, unknown, string, unknown, unknown]
      ): Promise<any[]> => {
        return callFlaskService(args, "/causal_whatif");
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
