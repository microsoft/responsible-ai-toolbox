// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ErrorCohort,
  IModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import React from "react";

import { ShiftCohort } from "./ShiftCohort";
interface IChangeGlobalCohortProps {
  visible: boolean;
  showAllDataCohort: boolean;
  onDismiss(): void;
}
export class ChangeGlobalCohort extends React.Component<IChangeGlobalCohortProps> {
  public static contextType = ModelAssessmentContext;
  public context: IModelAssessmentContext = defaultModelAssessmentContext;
  public render(): React.ReactNode {
    return (
      this.props.visible && (
        <ShiftCohort
          onDismiss={this.props.onDismiss}
          onApply={this.shiftErrorCohort}
          defaultCohort={this.context.baseErrorCohort}
          showAllDataCohort={this.props.showAllDataCohort}
        />
      )
    );
  }
  private shiftErrorCohort = (cohort: ErrorCohort): void => {
    this.context.shiftErrorCohort(cohort);
    this.props.onDismiss();
  };
}
