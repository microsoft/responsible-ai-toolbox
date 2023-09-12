// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  CohortEditor,
  DatasetCohort,
  defaultModelAssessmentContext,
  IModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

interface ICreateGlobalCohortProps {
  visible: boolean;
  onDismiss(): void;
}

export class CreateGlobalCohort extends React.Component<ICreateGlobalCohortProps> {
  public static contextType = ModelAssessmentContext;
  public context: IModelAssessmentContext = defaultModelAssessmentContext;
  public render(): React.ReactNode {
    return (
      this.props.visible && (
        <CohortEditor
          isFromExplanation={false}
          dataset={this.context.dataset}
          jointDataset={this.context.jointDataset}
          filterList={this.context.baseErrorCohort.cohort.filters}
          cohortName={`${localization.Interpret.Cohort.cohort} ${(
            this.context.errorCohorts.length + 1
          ).toString()}`}
          existingCohortNames={this.getExistingCohortName()}
          onSave={this.addCohort}
          isNewCohort
          deleteIsDisabled
          closeCohortEditor={this.props.onDismiss}
          closeCohortEditorPanel={this.props.onDismiss}
        />
      )
    );
  }

  private addCohort = (
    cohort: Cohort,
    datasetCohort?: DatasetCohort,
    switchNew?: boolean
  ): void => {
    this.context.addCohort(cohort, datasetCohort, switchNew);
    this.props.onDismiss();
  };

  private getExistingCohortName(): string[] {
    return this.context.errorCohorts
      .filter((errorCohort) => !errorCohort.isTemporary)
      .map((t) => t.cohort.name);
  }
}
