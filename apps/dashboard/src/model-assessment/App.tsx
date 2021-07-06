// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HelpMessageDict } from "@responsible-ai/error-analysis";
import { Language } from "@responsible-ai/localization";
import {
  ModelAssessmentDashboard,
  IModelAssessmentDashboardProps,
  IModelAssessmentData
} from "@responsible-ai/model-assessment";
import { ITheme } from "office-ui-fabric-react";
import React from "react";

import {
  generateJsonMatrix,
  generateJsonTreeBreastCancer,
  createJsonImportancesGenerator,
  createPredictionsRequestGenerator,
  DatasetName,
  generateJsonTreeBoston
} from "../error-analysis/utils";

interface IAppProps extends IModelAssessmentData {
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
    if (this.props.modelExplanationData) {
      for (const exp of this.props.modelExplanationData) {
        exp.modelClass = "blackbox";
      }
    }

    const modelAssessmentDashboardProps: IModelAssessmentDashboardProps = {
      ...this.props,
      locale: this.props.language,
      localUrl: "https://www.bing.com/",
      requestMatrix: generateJsonMatrix,
      requestPredictions: !this.props.classDimension
        ? undefined
        : createPredictionsRequestGenerator(this.props.classDimension),
      stringParams: { contextualHelp: this.messages },
      theme: this.props.theme
    };

    if (this.props.classDimension === 1) {
      // Boston
      modelAssessmentDashboardProps.requestDebugML = generateJsonTreeBoston;
      modelAssessmentDashboardProps.requestImportances = createJsonImportancesGenerator(
        this.props.dataset.feature_names,
        DatasetName.Boston
      );
    } else {
      // Adult
      modelAssessmentDashboardProps.requestDebugML = generateJsonTreeBreastCancer;
      modelAssessmentDashboardProps.requestImportances = createJsonImportancesGenerator(
        this.props.dataset.feature_names,
        DatasetName.BreastCancer
      );
    }

    return <ModelAssessmentDashboard {...modelAssessmentDashboardProps} />;
  }
}
