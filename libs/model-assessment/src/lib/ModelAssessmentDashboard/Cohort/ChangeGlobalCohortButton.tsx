// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ErrorCohort,
  IModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { DefaultButton } from "office-ui-fabric-react";
import React from "react";

import { ShiftCohort } from "./ShiftCohort";

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
            localization.ModelAssessment.CohortInformation.ChangeGlobalCohort
          }
          onClick={this.toggleShiftCohortVisibility}
        />
        {this.state.shiftCohortVisible && (
          <ShiftCohort
            onDismiss={this.toggleShiftCohortVisibility}
            onApply={this.shiftErrorCohort}
            defaultCohort={this.context.baseErrorCohort}
          />
        )}
      </>
    );
  }
  private shiftErrorCohort = (cohort: ErrorCohort) => {
    this.context.shiftErrorCohort(cohort);
    this.toggleShiftCohortVisibility();
  };
  private toggleShiftCohortVisibility = () => {
    this.setState((prev) => ({ shiftCohortVisible: !prev.shiftCohortVisible }));
  };
}
