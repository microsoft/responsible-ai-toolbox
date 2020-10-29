// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExplanationDashboardData } from "@responsible-ai/core-ui";
import {
  ErrorAnalysisDashboard,
  IErrorAnalysisDashboardProps,
  HelpMessageDict
} from "@responsible-ai/error-analysis";
import _ from "lodash";
import { ITheme } from "office-ui-fabric-react";
import React from "react";

import { dummyMatrixData } from "./__mock_data__/dummyMatrix";
import { dummyTreeData } from "./__mock_data__/dummyTree";

interface IAppProps {
  dataset: IExplanationDashboardData;
  theme: ITheme;
  language: string;
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
    const dashboardProp: IErrorAnalysisDashboardProps = {
      ...this.props.dataset,
      explanationMethod: "mimic",
      features: this.generateFeatures(),
      locale: this.props.language,
      localUrl: "https://www.bing.com/",
      requestDebugML: this.generateJsonTree,
      requestMatrix: this.generateJsonMatrix,
      requestPredictions: !this.props.classDimension
        ? undefined
        : this.requestPredictions,
      stringParams: { contextualHelp: this.messages },
      theme: this.props.theme
    };
    switch (this.props.version) {
      case 1:
      default:
        return <ErrorAnalysisDashboard {...dashboardProp} />;
    }
  }

  private generateJsonTree = (
    _data: any[],
    signal: AbortSignal
  ): Promise<any> => {
    const promise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve(_.cloneDeep(dummyTreeData));
      }, 300);
      signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });

    return promise;
  };

  private generateJsonMatrix = (
    _data: any[],
    signal: AbortSignal
  ): Promise<any> => {
    const promise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve(_.cloneDeep(dummyMatrixData));
      }, 300);
      signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });

    return promise;
  };

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

  private generateFeatures(): string[] {
    return [
      "Feature1",
      "Feature2",
      "Feature3",
      "Feature4",
      "Feature5",
      "Feature6",
      "Feature7",
      "Feature8",
      "Feature9",
      "Feature10",
      "Feature11",
      "Feature12",
      "Feature13",
      "Feature14",
      "Feature15"
    ];
  }
}
