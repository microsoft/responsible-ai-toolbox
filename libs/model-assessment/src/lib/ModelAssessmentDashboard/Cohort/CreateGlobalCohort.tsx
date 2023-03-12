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
    const cohortsLength =
      this.context.isRefactorFlightOn && this.context.datasetCohorts
        ? this.context.datasetCohorts.length + 1
        : this.context.errorCohorts.length + 1;

    return (
      this.props.visible && (
        <CohortEditor
          jointDataset={this.context.jointDataset}
          legacyFilterList={this.context.baseErrorCohort.cohort.filters}
          filterList={this.context.baseDatasetCohort?.filters}
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
    cohort: Cohort,
    datasetCohort?: DatasetCohort,
    switchNew?: boolean
  ): void => {
    this.context.addCohort(cohort, switchNew, datasetCohort);
    this.props.onDismiss();
  };

  private getExistingCohortName(): string[] {
    return this.context.errorCohorts
      .filter((errorCohort) => !errorCohort.isTemporary)
      .map((t) => t.cohort.name);
  }
}
