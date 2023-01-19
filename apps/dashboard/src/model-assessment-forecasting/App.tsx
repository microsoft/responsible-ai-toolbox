// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
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
  public render(): React.ReactNode {
    this.props.modelExplanationData?.forEach(
      (modelExplanationData) => (modelExplanationData.modelClass = "blackbox")
    );
    const modelAssessmentDashboardProps: IModelAssessmentDashboardProps = {
      ...this.props,
      cohortData: [
        giorgiosPizzeriaBoston,
        nonnasCannoliBoston,
        bobsSandwichesSandwich
      ],
      locale: this.props.language,
      localUrl: "https://www.bing.com/",
      requestForecast: this.requestForecast
    };

    return <ModelAssessmentDashboard {...modelAssessmentDashboardProps} />;
  }

  private requestForecast = (
    x: any[],
    abortSignal: AbortSignal
  ): Promise<any[]> => {
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
        const preds = this.props.dataset.predicted_y?.slice(
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
