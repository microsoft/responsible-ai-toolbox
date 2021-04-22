// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CohortInfo, CohortList } from "@responsible-ai/core-ui";
import React from "react";
export interface IModelAssessmentCohortProps {}
interface IModelAssessmentCohortState {}

export class ModelAssessmentCohort extends React.Component<
  IModelAssessmentCohortProps,
  IModelAssessmentCohortState
> {
  public render(): React.ReactNode {
    return (
      <>
        <CohortInfo
          isOpen={this.state.openInfoPanel}
          currentCohort={this.state.selectedCohort}
          onDismiss={(): void => this.setState({ openInfoPanel: false })}
          onSaveCohortClick={(): void =>
            this.setState({ openSaveCohort: true })
          }
        />
        <CohortList
          cohorts={this.state.cohorts}
          isOpen={this.state.openCohortListPanel}
          onDismiss={(): void => this.setState({ openCohortListPanel: false })}
          onEditCohortClick={(editedCohort: ErrorCohort): void =>
            this.setState({
              editedCohort,
              openEditCohort: true
            })
          }
        />
      </>
    );
  }
}
