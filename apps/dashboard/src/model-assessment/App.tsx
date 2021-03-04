// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IDataset,
  IModelExplanationData
} from "@responsible-ai/core-ui";
import { HelpMessageDict } from "@responsible-ai/error-analysis";
import { Language } from "@responsible-ai/localization";
import {
  ModelAssessmentDashboard,
  IModelAssessmentDashboardProps
} from "@responsible-ai/model-assessment";
import _ from "lodash";
import { ITheme } from "office-ui-fabric-react";
import React from "react";

import {
  generateJsonTreeAdultCensusIncome,
  generateJsonMatrix,
  generateFeatures,
  generateJsonTreeBreastCancer,
  createJsonImportancesGenerator,
  createPredictionsRequestGenerator
} from "../error-analysis/utils";
import {
  generateRandomMetrics,
  supportedBinaryClassificationPerformanceKeys,
  supportedProbabilityPerformanceKeys,
  supportedRegressionPerformanceKeys
} from "../fairness/utils";

interface IAppProps {
  dataset: IDataset;
  modelExplanationData: IModelExplanationData;
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
    this.props.modelExplanationData.modelClass = "blackbox";

    const modelAssessmentDashboardProps: IModelAssessmentDashboardProps = {
      dataset: this.props.dataset,
      locale: this.props.language,
      localUrl: "",
      modelExplanationData: this.props.modelExplanationData,
      requestDebugML: generateJsonTreeAdultCensusIncome,
      requestImportances: createJsonImportancesGenerator(
        this.props.dataset.featureNames!,
        false
      ),
      requestMatrix: generateJsonMatrix,
      requestMetrics: generateRandomMetrics.bind(this),
      requestPredictions: !this.props.classDimension
        ? undefined
        : createPredictionsRequestGenerator(this.props.classDimension),
      stringParams: { contextualHelp: this.messages },
      supportedBinaryClassificationPerformanceKeys,
      supportedProbabilityPerformanceKeys,
      supportedRegressionPerformanceKeys,
      theme: this.props.theme
    };

    if ("categoricalMap" in this.props.dataset) {
      return <ModelAssessmentDashboard {...modelAssessmentDashboardProps} />;
    }

    modelAssessmentDashboardProps.dataset.featureNames = generateFeatures();
    modelAssessmentDashboardProps.localUrl = "https://www.bing.com/";
    modelAssessmentDashboardProps.requestDebugML = generateJsonTreeBreastCancer;
    modelAssessmentDashboardProps.requestImportances = createJsonImportancesGenerator(
      this.props.dataset.featureNames,
      true
    );

    return <ModelAssessmentDashboard {...modelAssessmentDashboardProps} />;
  }
}
