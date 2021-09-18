// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  CohortEditor,
  defaultModelAssessmentContext,
  IModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { DefaultButton } from "office-ui-fabric-react";
import React from "react";

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
        {this.state.createCohortVisible && (
          <CohortEditor
            jointDataset={this.context.jointDataset}
            filterList={this.context.baseErrorCohort.cohort.filters}
            cohortName={`${localization.Interpret.Cohort.cohort} ${(
              this.context.errorCohorts.length + 1
            ).toString()}`}
            existingCohortNames={this.getExistingCohortName()}
            onSave={this.addCohort}
            isNewCohort
            deleteIsDisabled
            closeCohortEditor={(): void => {
              this.setState((prev) => ({
                createCohortVisible: !prev.createCohortVisible
              }));
            }}
            closeCohortEditorPanel={(): void => {
              this.setState((prev) => ({
                createCohortVisible: !prev.createCohortVisible
              }));
            }}
          />
        )}
      </>
    );
  }
  private addCohort = (cohort: Cohort) => {
    this.context.addCohort(cohort);
    this.toggleVisibility();
  };
  private toggleVisibility = () => {
    this.setState((prev) => ({
      createCohortVisible: !prev.createCohortVisible
    }));
  };
  private getExistingCohortName(): string[] {
    return this.context.errorCohorts
      .filter((errorCohort) => !errorCohort.isTemporary)
      .map((t) => t.cohort.name);
  }
}
