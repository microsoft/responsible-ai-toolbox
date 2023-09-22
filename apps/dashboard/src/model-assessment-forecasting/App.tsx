// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import { IPreBuiltCohort } from "@responsible-ai/core-ui";
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
  prebuildCohorts?: boolean;
}

export class App extends React.Component<IAppProps> {
  public render(): React.ReactNode {
    this.props.modelExplanationData?.forEach(
      (modelExplanationData) => (modelExplanationData.modelClass = "blackbox")
    );
    let cohortData: IPreBuiltCohort[] | undefined;
    if (this.props.prebuildCohorts) {
      switch (this.props.dataset.features.length) {
        case 10:
          cohortData = [bobsSandwichesSandwich];
          break;
        case 30:
          cohortData = [
            giorgiosPizzeriaBoston,
            nonnasCannoliBoston,
            bobsSandwichesSandwich
          ];
          break;
        default:
          throw new Error(
            "Invalid dataset. Test env is not aware of this dataset."
          );
      }
    }
    const modelAssessmentDashboardProps: IModelAssessmentDashboardProps = {
      ...this.props,
      cohortData,
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
        let preds: number[];
        if (this.props.dataset.predicted_y?.length === 10) {
          preds = this.props.dataset.predicted_y as number[];
        } else {
          let start: number;
          let end: number;
          if (x[0][0].arg[0] === 1) {
            // Giorgio's pizzeria
            start = 0;
            end = 10;
          } else if (x[0][0].arg[0] === 0) {
            // Bob's sandwiches
            start = 20;
            end = 30;
          } else {
            // Nonna's cannolis
            start = 10;
            end = 20;
          }
          preds = this.props.dataset.predicted_y?.slice(start, end) as number[];
        }
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
