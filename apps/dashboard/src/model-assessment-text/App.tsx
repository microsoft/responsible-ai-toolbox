// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import { IModelExplanationData } from "@responsible-ai/core-ui";
import { HelpMessageDict } from "@responsible-ai/error-analysis";
import { Language } from "@responsible-ai/localization";
import {
  ModelAssessmentDashboard,
  IModelAssessmentDashboardProps,
  IModelAssessmentData
} from "@responsible-ai/model-assessment";
import React from "react";

import { getSquadModelExplanationData } from "./__mock_data__/squad";

interface IAppProps extends IModelAssessmentData {
  theme: ITheme;
  language: Language;
  version: 1 | 2;
  classDimension?: 1 | 2 | 3;
  featureFlights?: string[];
}

interface IAppState {
  modelExplanationData:
    | Array<
        Omit<IModelExplanationData, "method" | "predictedY" | "probabilityY">
      >
    | undefined;
}

export class App extends React.PureComponent<IAppProps, IAppState> {
  private messages: HelpMessageDict = {
    LocalExpAndTestReq: [{ displayText: "LocalExpAndTestReq", format: "text" }],
    LocalOrGlobalAndTestReq: [
      { displayText: "LocalOrGlobalAndTestReq", format: "text" }
    ],
    PredictorReq: [{ displayText: "PredictorReq", format: "text" }],
    TestReq: [{ displayText: "TestReq", format: "text" }]
  };

  public constructor(props: IAppProps) {
    super(props);
    this.state = {
      modelExplanationData: props.modelExplanationData
    };
  }

  public render(): React.ReactNode {
    let key = "modelAssessment";
    const modelAssessmentDashboardProps: IModelAssessmentDashboardProps = {
      ...this.props,
      locale: this.props.language,
      localUrl: "https://www.bing.com/",
      modelExplanationData: this.state.modelExplanationData,
      stringParams: { contextualHelp: this.messages },
      theme: this.props.theme
    };
    const isQuestionAnswering =
      this.props.dataset.task_type === "question_answering";
    if (modelAssessmentDashboardProps.modelExplanationData) {
      for (const exp of modelAssessmentDashboardProps.modelExplanationData) {
        exp.modelClass = "blackbox";
      }
      if (isQuestionAnswering) {
        key = `modelAssessment_${this.props.dataset.task_type}`;
      }
    } else if (isQuestionAnswering) {
      this.loadSquadDataset();
    }

    // use key to re-create the component when the explanation data is updated
    // for question answering
    return (
      <ModelAssessmentDashboard key={key} {...modelAssessmentDashboardProps} />
    );
  }

  private loadSquadDataset(): void {
    getSquadModelExplanationData().then((data) => {
      this.setState({ modelExplanationData: [data] });
    });
  }
}
