// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import { HelpMessageDict } from "@responsible-ai/error-analysis";
import { Language } from "@responsible-ai/localization";
import {
  ModelAssessmentDashboard,
  IModelAssessmentDashboardProps,
  IModelAssessmentData
} from "@responsible-ai/model-assessment";
import React from "react";

interface IAppProps extends IModelAssessmentData {
  theme: ITheme;
  language: Language;
  version: 1 | 2;
  classDimension?: 1 | 2 | 3;
  featureFlights?: string[];
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

  public async generateRandomObjectDetectionMetrics(
    selectionIndexes: number[][],
    className: string
  ): Promise<any[]> {
    const returnedValues: any[] = [];
    selectionIndexes.forEach(() => {
      returnedValues.push([Math.random(), Math.random(), Math.random()]);
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return [returnedValues, [className]];
  }

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
      requestObjectDetectionMetrics: (selectionIndexes, _, className) =>
        this.generateRandomObjectDetectionMetrics(selectionIndexes, className),
      stringParams: { contextualHelp: this.messages },
      theme: this.props.theme
    };

    return <ModelAssessmentDashboard {...modelAssessmentDashboardProps} />;
  }
}
