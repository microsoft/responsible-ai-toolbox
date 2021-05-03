// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICasualAnalysisData,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import React from "react";


export interface ITreatmentViewProps {
  data: ICasualAnalysisData;
}
interface ITreatmentViewState {
  showModalHelp: boolean;
}

export class TreatmentView extends React.PureComponent<ITreatmentViewProps, ITreatmentViewState> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;
  constructor(props: ITreatmentViewProps) {
    super(props);
    this.state = {
      showModalHelp: false
    };
  }

  public render(): React.ReactNode {
    return <div>"Treatment ITreatmentViewState</div>;
  }
}
