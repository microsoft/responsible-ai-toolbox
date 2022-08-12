// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { VisionExplanationDashboard } from "@responsible-ai/interpret-vision";
import React from "react";

import { callFlaskService } from "./callFlaskService";
import { config } from "./config";
//import { modelData } from "./modelData";
interface IInterpretProps {
  dashboardType?: "ModelPerformance";
}
export class InterpretVision extends React.Component<IInterpretProps> {
  public render(): React.ReactNode {
    let requestMethod = undefined;
    if (config.baseUrl) {
      requestMethod = (request: number): Promise<any[]> => {
        return callFlaskService(request, "/get_exp");
      };
    }

    return (
      <VisionExplanationDashboard
        dataSummary={{ images: [], localExplanations: [] }}
        requestExp={requestMethod}
      />
    );
  }
}
