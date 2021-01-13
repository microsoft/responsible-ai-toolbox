// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IExplanationDashboardData,
  ISerializedExplanationData
} from "@responsible-ai/core-ui";
import {
  ErrorAnalysisDashboard,
  IErrorAnalysisDashboardProps,
  HelpMessageDict
} from "@responsible-ai/error-analysis";
import { Language } from "@responsible-ai/localization";
import _ from "lodash";
import { ITheme } from "office-ui-fabric-react";
import React from "react";

import { dummyMatrixData } from "./__mock_data__/dummyMatrix";
import { dummyMatrix1dInterval } from "./__mock_data__/dummyMatrixOnedInterval";
import { dummyMatrix2dInterval } from "./__mock_data__/dummyMatrixTwodInterval";
import { dummyTreeAdultCensusIncomeData } from "./__mock_data__/dummyTreeAdultCensusIncome";
import { dummyTreeBreastCancerData } from "./__mock_data__/dummyTreeBreastCancer";

interface IAppProps {
  dataset: IExplanationDashboardData | ISerializedExplanationData;
  theme: ITheme;
  language: Language;
  version: 1;
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
    if ("categoricalMap" in this.props.dataset) {
      return (
        <ErrorAnalysisDashboard
          modelInformation={{ modelClass: "blackbox" }}
          dataSummary={{
            categoricalMap: this.props.dataset.categoricalMap,
            classNames: this.props.dataset.classNames,
            featureNames: this.props.dataset.featureNames
          }}
          testData={this.props.dataset.trainingData}
          predictedY={this.props.dataset.predictedY as any}
          probabilityY={this.props.dataset.probabilityY}
          trueY={this.props.dataset.trueY as any}
          precomputedExplanations={{
            localFeatureImportance: this.props.dataset.localExplanations
          }}
          requestPredictions={
            !this.props.classDimension ? undefined : this.requestPredictions
          }
          requestDebugML={this.generateJsonTreeAdultCensusIncome}
          requestMatrix={this.generateJsonMatrix}
          localUrl={""}
          locale={undefined}
          features={this.props.dataset.featureNames}
        />
      );
    }
    const dashboardProp: IErrorAnalysisDashboardProps = {
      ...(this.props.dataset as IExplanationDashboardData),
      explanationMethod: "mimic",
      features: this.generateFeatures(),
      locale: this.props.language,
      localUrl: "https://www.bing.com/",
      requestDebugML: this.generateJsonTreeBreastCancer,
      requestMatrix: this.generateJsonMatrix,
      requestPredictions: !this.props.classDimension
        ? undefined
        : this.requestPredictions,
      stringParams: { contextualHelp: this.messages },
      theme: this.props.theme
    };
    return <ErrorAnalysisDashboard {...dashboardProp} />;
  }

  private generateJsonTree(
    _data: any[],
    signal: AbortSignal,
    isBreastCancer: boolean
  ): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (isBreastCancer) {
          resolve(_.cloneDeep(dummyTreeBreastCancerData));
        } else {
          resolve(_.cloneDeep(dummyTreeAdultCensusIncomeData));
        }
      }, 300);
      signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });

    return promise;
  }

  private generateJsonTreeBreastCancer = (
    _data: any[],
    signal: AbortSignal
  ): Promise<any> => {
    return this.generateJsonTree(_data, signal, true);
  };

  private generateJsonTreeAdultCensusIncome = (
    _data: any[],
    signal: AbortSignal
  ): Promise<any> => {
    return this.generateJsonTree(_data, signal, false);
  };

  private generateJsonMatrix = (
    data: any[],
    signal: AbortSignal
  ): Promise<any> => {
    const promise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (
          data.length === 3 &&
          data[0][0] === "mean radius" &&
          data[0][1] === "mean texture"
        ) {
          resolve(_.cloneDeep(dummyMatrix2dInterval));
        } else if (data[0][0] === "mean radius") {
          resolve(_.cloneDeep(dummyMatrix1dInterval));
        } else {
          resolve(_.cloneDeep(dummyMatrixData));
        }
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
      "mean radius",
      "mean texture",
      "mean perimeter",
      "mean area",
      "mean smoothness",
      "mean compactness",
      "mean concavity",
      "mean concave points",
      "mean symmetry",
      "mean fractal dimension",
      "radius error",
      "texture error",
      "perimeter error",
      "area error",
      "smoothness error",
      "compactness error",
      "concavity error",
      "concave points error",
      "symmetry error",
      "fractal dimension error",
      "worst radius",
      "worst texture",
      "worst perimeter",
      "worst area",
      "worst smoothness",
      "worst compactness",
      "worst concavity",
      "worst concave points",
      "worst symmetry",
      "worst fractal dimension"
    ];
  }
}
