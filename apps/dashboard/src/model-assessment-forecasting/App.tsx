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
import {
  bobsSandwichesSandwich,
  giorgiosPizzeriaBoston,
  nonnasCannoliBoston
} from "./__mock_data__/mockForecastingData";

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
      requestForecast: this.requestForecast,
      stringParams: { contextualHelp: this.messages },
      theme: this.props.theme,
      cohortData: [
        giorgiosPizzeriaBoston,
        nonnasCannoliBoston,
        bobsSandwichesSandwich
      ]
    };

    return <ModelAssessmentDashboard {...modelAssessmentDashboardProps} />;
  }

  private requestForecast = (
    x: any[],
    abortSignal: AbortSignal
  ): Promise<any[]> => {
    console.log(x);
    return new Promise<number[]>((resolver) => {
      setTimeout(() => {
        if (abortSignal.aborted) {
          return;
        }
        let start: number;
        let end: number;
        if (x[0][0].arg[0] === 1) {
          // Giorgio's pizzeria
          start = 0;
          end = 10;
        } else if (x[0][0].arg[0] === 0) {
          // Bob's sandwiches
          start = 10;
          end = 20;
        } else {
          // Nonna's cannolis
          start = 20;
          end = 30;
        }
        let preds = this.props.dataset.predicted_y?.slice(
          start,
          end
        ) as number[];
        if (x[2].length === 0) {
          // return original predictions
          resolver(preds);
        } else {
          // return predictions based on modified features
          // we have to mock this part since we don't have a model available
          resolver(preds.map((p) => p + 200 * (Math.random() - 0.5)));
        }
      }, 300);
    });
  };
}
