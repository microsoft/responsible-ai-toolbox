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

import { ChangeGlobalCohort } from "./ChangeGlobalCohort";

interface IChangeGlobalCohortButtonProps {
  showAllDataCohort: boolean;
}

interface IChangeGlobalCohortButtonState {
  shiftCohortVisible: boolean;
}

export class ChangeGlobalCohortButton extends React.Component<
  IChangeGlobalCohortButtonProps,
  IChangeGlobalCohortButtonState
> {
  public static contextType = ModelAssessmentContext;
  public context: IModelAssessmentContext = defaultModelAssessmentContext;
  public constructor(props: IChangeGlobalCohortButtonProps) {
    super(props);
    this.state = { shiftCohortVisible: false };
  }
  public render(): React.ReactNode {
    return (
      <>
        <DefaultButton
          text={localization.ModelAssessment.CohortInformation.ShiftCohort}
          onClick={this.toggleShiftCohortVisibility}
        />
        <ChangeGlobalCohort
          visible={this.state.shiftCohortVisible}
          onDismiss={this.toggleShiftCohortVisibility}
          showAllDataCohort={this.props.showAllDataCohort}
        />
      </>
    );
  }
  private toggleShiftCohortVisibility = (): void => {
    this.setState((prev) => ({ shiftCohortVisible: !prev.shiftCohortVisible }));
  };
}
