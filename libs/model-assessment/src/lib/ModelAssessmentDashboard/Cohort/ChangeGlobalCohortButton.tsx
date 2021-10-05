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

import { ChangeGlobalCohort } from "./ChangeGlobalCohort";

interface IChangeGlobalCohortButtonState {
  shiftCohortVisible: boolean;
}

export class ChangeGlobalCohortButton extends React.Component<
  Record<string, never>,
  IChangeGlobalCohortButtonState
> {
  public static contextType = ModelAssessmentContext;
  public context: IModelAssessmentContext = defaultModelAssessmentContext;
  public constructor(props: Record<string, never>) {
    super(props);
    this.state = { shiftCohortVisible: false };
  }
  public render(): React.ReactNode {
    return (
      <>
        <DefaultButton
          text={
            localization.ModelAssessment.CohortInformation.SwitchGlobalCohort
          }
          onClick={this.toggleShiftCohortVisibility}
        />
        <ChangeGlobalCohort
          visible={this.state.shiftCohortVisible}
          onDismiss={this.toggleShiftCohortVisibility}
        />
      </>
    );
  }
  private toggleShiftCohortVisibility = () => {
    this.setState((prev) => ({ shiftCohortVisible: !prev.shiftCohortVisible }));
  };
}
