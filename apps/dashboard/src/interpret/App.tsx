// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  NewExplanationDashboard,
  ExplanationDashboard,
  ITelemetryMessage,
  IExplanationDashboardProps,
  IExplanationDashboardData,
  HelpMessageDict
} from "@responsible-ai/interpret";
import { ITheme } from "office-ui-fabric-react";
import React from "react";

interface IAppProps {
  dataset: IExplanationDashboardData;
  theme: ITheme;
  language: string;
  version: 1 | 2;
  classDimension: number;
}

export class App extends React.Component<IAppProps> {
  private messages: HelpMessageDict = {
    LocalExpAndTestReq: [{ displayText: "LocalExpAndTestReq", format: "text" }],
    LocalOrGlobalAndTestReq: [
      { displayText: "LocalOrGlobalAndTestReq", format: "text" }
    ],
    TestReq: [{ displayText: "TestReq", format: "text" }],
    PredictorReq: [{ displayText: "PredictorReq", format: "text" }]
  };

  public render(): React.ReactNode {
    const dashboardProp: IExplanationDashboardProps = {
      ...this.props.dataset,
      requestPredictions:
        this.props.classDimension === 1
          ? this.generateRandomScore
          : this.generateRandomProbs.bind(this, this.props.classDimension),
      stringParams: { contextualHelp: this.messages },
      telemetryHook: (er: ITelemetryMessage): void => {
        console.error(er.message);
      },
      theme: this.props.theme,
      explanationMethod: "mimic",
      locale: this.props.language
    };
    switch (this.props.version) {
      case 1:
        return <ExplanationDashboard {...dashboardProp} />;
      case 2:
      default:
        return <NewExplanationDashboard {...dashboardProp} />;
    }
  }

  private generateRandomScore = (
    data: any[],
    signal: AbortSignal
  ): Promise<any[]> => {
    const promise = new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve(data.map(() => Math.random()));
      }, 300);
      signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });

    return promise;
  };

  private generateRandomProbs(
    classDimensions: number,
    data: any[],
    signal: AbortSignal
  ): Promise<any[]> {
    const promise = new Promise<any[]>((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve(
          data.map(() =>
            Array.from({ length: classDimensions }, () => Math.random())
          )
        );
      }, 300);
      signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });

    return promise;
  }
}
