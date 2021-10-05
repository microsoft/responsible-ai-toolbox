// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  IModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { DefaultButton } from "office-ui-fabric-react";
import React from "react";

import { CreateGlobalCohort } from "./CreateGlobalCohort";

interface ICreateGlobalCohortButtonState {
  createCohortVisible: boolean;
}

export class CreateGlobalCohortButton extends React.Component<
  Record<string, never>,
  ICreateGlobalCohortButtonState
> {
  public static contextType = ModelAssessmentContext;
  public context: IModelAssessmentContext = defaultModelAssessmentContext;
  public constructor(props: Record<string, never>) {
    super(props);
    this.state = { createCohortVisible: false };
  }
  public render(): React.ReactNode {
    return (
      <>
        <DefaultButton
          text={localization.ModelAssessment.CohortInformation.CreateNewCohort}
          onClick={this.toggleVisibility}
        />
        <CreateGlobalCohort
          visible={this.state.createCohortVisible}
          onDismiss={this.toggleVisibility}
        />
      </>
    );
  }
  private toggleVisibility = () => {
    this.setState((prev) => ({
      createCohortVisible: !prev.createCohortVisible
    }));
  };
}
