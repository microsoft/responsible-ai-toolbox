// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import {
  IExplanationDashboardData,
  ITelemetryMessage
} from "@responsible-ai/core-ui";
import {
  NewExplanationDashboard,
  ExplanationDashboard,
  IExplanationDashboardProps,
  HelpMessageDict
} from "@responsible-ai/interpret";
import { Language } from "@responsible-ai/localization";
import React from "react";

interface IAppProps {
  dataset: IExplanationDashboardData;
  theme: ITheme;
  language: Language;
  version: 1 | 2;
  classDimension?: 1 | 2 | 3;
}

export class App extends React.Component<IAppProps> {
  private messages: HelpMessageDict = {
    LocalExpAndTestReq: [{ displayText: "LocalExpAndTestReq", format: "text" }],
    LocalOrGlobalAndTestReq: [
      { displayText: "LocalOrGlobalAndTestReq", format: "text" }
    ],
    PredictorReq: [{ displayText: "PredictorReq", format: "text" }],
    TestReq: [{ displayText: "TestReq", format: "text" }]
  };

  public render(): React.ReactNode {
    const dashboardProp: IExplanationDashboardProps = {
      ...this.props.dataset,
      explanationMethod: "mimic",
      locale: this.props.language,
      requestPredictions: !this.props.classDimension
        ? undefined
        : this.requestPredictions,
      stringParams: { contextualHelp: this.messages },
      telemetryHook: (er: ITelemetryMessage): void => {
        console.error(er.message);
      },
      theme: this.props.theme
    };
    switch (this.props.version) {
      case 1:
        return <ExplanationDashboard {...dashboardProp} />;
      case 2:
      default:
        return <NewExplanationDashboard {...dashboardProp} />;
    }
  }

  private requestPredictions = (
    data: any[],
    signal: AbortSignal
  ): Promise<any[]> => {
    return !this.props.classDimension || this.props.classDimension === 1
      ? this.generateRandomScore(data, signal)
      : this.generateRandomProbs(this.props.classDimension, data, signal);
  };

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
    classDimensions: 2 | 3,
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
