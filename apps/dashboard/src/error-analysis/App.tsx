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
import {
  createJsonImportancesGenerator,
  createPredictionsRequestGenerator,
  generateFeatures,
  generateJsonMatrix,
  generateJsonTreeAdultCensusIncome,
  generateJsonTreeBreastCancer
} from "./utils";

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
            !this.props.classDimension
              ? undefined
              : createPredictionsRequestGenerator(this.props.classDimension)
          }
          requestDebugML={generateJsonTreeAdultCensusIncome}
          requestMatrix={generateJsonMatrix}
          requestImportances={createJsonImportancesGenerator(
            this.props.dataset.featureNames,
            false
          )}
          localUrl={""}
          locale={undefined}
          features={this.props.dataset.featureNames}
        />
      );
    }
    const dashboardProp: IErrorAnalysisDashboardProps = {
      ...(this.props.dataset as IExplanationDashboardData),
      explanationMethod: "mimic",
      features: generateFeatures(),
      locale: this.props.language,
      localUrl: "https://www.bing.com/",
      requestDebugML: generateJsonTreeBreastCancer,
      requestImportances: createJsonImportancesGenerator(
        "dataSummary" in this.props.dataset
          ? this.props.dataset.dataSummary.featureNames!
          : [],
        true
      ),
      requestMatrix: generateJsonMatrix,
      requestPredictions: !this.props.classDimension
        ? undefined
        : createPredictionsRequestGenerator(this.props.classDimension),
      stringParams: { contextualHelp: this.messages },
      theme: this.props.theme
    };
    return <ErrorAnalysisDashboard {...dashboardProp} />;
  }
}
