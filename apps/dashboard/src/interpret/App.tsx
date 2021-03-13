// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExplanationDashboardData } from "@responsible-ai/core-ui";
import {
  NewExplanationDashboard,
  ITelemetryMessage,
  IExplanationDashboardProps,
  HelpMessageDict
} from "@responsible-ai/interpret";
import { Language } from "@responsible-ai/localization";
import { ITheme } from "office-ui-fabric-react";
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
      // The first version of ExplanationDashboard is no longer available - refer to branch
      // rolutz/branch_with_fairness_v1_and_interpret_v1 if needed
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
