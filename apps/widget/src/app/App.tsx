// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";

import { config } from "./config";
import { ErrorAnalysis } from "./ErrorAnalysis";
import { Fairness } from "./Fairness";
import { Interpret } from "./Interpret";
import { InterpretVision } from "./InterpretVision";
import { ModelAssessment } from "./ModelAssessment";

export class App extends React.Component {
  public render(): React.ReactNode {
    switch (config.dashboardType) {
      case "Fairness":
        return <Fairness />;
      case "Interpret":
        return <Interpret />;
      case "ModelPerformance":
        return <Interpret dashboardType={config.dashboardType} />;
      case "ErrorAnalysis":
        return <ErrorAnalysis />;
      case "ResponsibleAI":
        return <ModelAssessment />;
      case "Vision":
        return <InterpretVision />;
      default:
        return "Not Found";
    }
  }
}
