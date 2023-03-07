// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  CohortEditor,
  DatasetCohort,
  defaultModelAssessmentContext,
  IModelAssessmentContext,
  isFlightActive,
  ModelAssessmentContext,
  RefactorFlight
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
    const isRefactorFlightOn = isFlightActive(
      RefactorFlight,
      this.context.featureFlights
    );
    const cohortsLength =
      isRefactorFlightOn && this.context.datasetCohorts
        ? this.context.datasetCohorts.length + 1
        : this.context.errorCohorts.length + 1;

    return (
      this.props.visible && (
        <CohortEditor
          jointDataset={this.context.jointDataset}
          filterList={this.context.baseErrorCohort.cohort.filters}
          cohortName={`${
            localization.Interpret.Cohort.cohort
          } ${cohortsLength?.toString()}`}
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
    cohort: Cohort | DatasetCohort,
    switchNew?: boolean
  ): void => {
    this.context.addCohort(cohort, switchNew);
    this.props.onDismiss();
  };

  private getExistingCohortName(): string[] {
    return this.context.errorCohorts
      .filter((errorCohort) => !errorCohort.isTemporary)
      .map((t) => t.cohort.name);
  }
}
