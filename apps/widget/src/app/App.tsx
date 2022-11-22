// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Spinner } from "@fluentui/react";
import React from "react";

import { getConfig, IAppConfig } from "./config";
import { ErrorAnalysis } from "./ErrorAnalysis";
import { Fairness } from "./Fairness";
import { Interpret } from "./Interpret";
import { ModelAssessment } from "./ModelAssessment";
import { getModelData } from "./modelData";

interface IAppState {
  config?: IAppConfig;
  modelData?: any;
}
export class App extends React.Component<unknown, IAppState> {
  public constructor(props: unknown) {
    super(props);
    this.state = {};
  }
  public componentDidMount(): void {
    this.loadData();
  }
  public render(): React.ReactNode {
    if (!this.state.config || !this.state.modelData) {
      return <Spinner />;
    }
    switch (this.state.config.dashboardType) {
      case "Fairness":
        return (
          <Fairness
            config={this.state.config}
            modelData={this.state.modelData}
          />
        );
      case "Interpret":
        return (
          <Interpret
            config={this.state.config}
            modelData={this.state.modelData}
          />
        );
      case "ModelPerformance":
        return (
          <Interpret
            dashboardType={this.state.config.dashboardType}
            config={this.state.config}
            modelData={this.state.modelData}
          />
        );
      case "ErrorAnalysis":
        return (
          <ErrorAnalysis
            config={this.state.config}
            modelData={this.state.modelData}
          />
        );
      case "ResponsibleAI":
        return (
          <ModelAssessment
            config={this.state.config}
            modelData={this.state.modelData}
          />
        );
      default:
        return "Not Found";
    }
  }
  private loadData = async (): Promise<void> => {
    const config = await getConfig();
    const modelData = await getModelData();
    this.setState({ config, modelData });
  };
}
