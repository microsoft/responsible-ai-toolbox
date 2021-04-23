// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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
import { TreeView } from "@responsible-ai/mlchartlib";
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
    const a = 1;
    if (a + 1 === 2) {
      return (
        <TreeView
          rootNode={{
            children: [
              {
                fillAmount: 1 / 22,
                pathThickness: 1 + Math.floor(30 * (22 / 174)),
                text: "1/22",
                textOnPath: "t1"
              },
              {
                fillAmount: 17 / 26,
                pathThickness: 1 + Math.floor(26 * (22 / 174)),
                text: "17/26",
                textOnPath: "martial-status == Married-civ-spouse"
              },
              {
                fillAmount: 17 / 26,
                pathThickness: 1 + Math.floor(26 * (22 / 174)),
                text: "17/26",
                textOnPath: "martial-status == Married-civ-spouse"
              }
            ],
            text: "18/48"
          }}
        />
      );
    }
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
