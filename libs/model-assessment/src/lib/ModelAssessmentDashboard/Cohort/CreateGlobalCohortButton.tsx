// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DefaultButton } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  IModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
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
          text={localization.ModelAssessment.CohortInformation.NewCohort}
          onClick={this.toggleVisibility}
        />
        <CreateGlobalCohort
          visible={this.state.createCohortVisible}
          onDismiss={this.toggleVisibility}
        />
      </>
    );
  }
  private toggleVisibility = (): void => {
    this.setState((prev) => ({
      createCohortVisible: !prev.createCohortVisible
    }));
  };
}
