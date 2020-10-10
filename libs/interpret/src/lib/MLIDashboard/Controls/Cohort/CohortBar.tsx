// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import React from "react";

import { Cohort } from "../../Cohort";
import { IExplanationModelMetadata } from "../../IExplanationContext";
import { JointDataset } from "../../JointDataset";

import { CohortEditor } from "./CohortEditor";
import { CohortList } from "./CohortList";
import { ICohort } from "./ICohort";

export interface ICohortBarProps {
  cohorts: Cohort[];
  jointDataset: JointDataset;
  modelMetadata: IExplanationModelMetadata;
  onCohortsChange(cohorts: Cohort[]): void;
}
interface ICohortBarState {
  editingCohortIndex?: number;
}

export class CohortBar extends React.Component<
  ICohortBarProps,
  ICohortBarState
> {
  public constructor(props: ICohortBarProps) {
    super(props);
    this.state = {
      editingCohortIndex: undefined
    };
  }
  public render(): React.ReactNode {
    let cohortForEdit: ICohort | undefined;
    if (this.state.editingCohortIndex !== undefined) {
      if (this.state.editingCohortIndex === this.props.cohorts.length) {
        cohortForEdit = {
          cohortName: localization.formatString(
            localization.Interpret.CohortEditor.placeholderName,
            this.state.editingCohortIndex
          ),
          filterList: []
        };
      } else {
        cohortForEdit = {
          cohortName: this.props.cohorts[this.state.editingCohortIndex].name,
          filterList: [
            ...this.props.cohorts[this.state.editingCohortIndex].filters
          ]
        };
      }
    }
    return (
      <>
        <CohortList
          cohorts={this.props.cohorts}
          jointDataset={this.props.jointDataset}
          metadata={this.props.modelMetadata}
          editCohort={this.editCohort}
          cloneAndEdit={this.cloneAndEditCohort}
        />
        {cohortForEdit !== undefined && (
          <CohortEditor
            jointDataset={this.props.jointDataset}
            filterList={cohortForEdit.filterList}
            cohortName={cohortForEdit.cohortName}
            onSave={this.onCohortChange}
            onCancel={this.closeCohortEditor}
            onDelete={this.deleteCohort}
            isNewCohort={
              this.state.editingCohortIndex === this.props.cohorts.length
            }
            deleteIsDisabled={this.props.cohorts.length === 1}
          />
        )}
      </>
    );
  }
  private onCohortChange = (newCohort: Cohort): void => {
    if (this.state.editingCohortIndex) {
      const prevCohorts = [...this.props.cohorts];
      prevCohorts[this.state.editingCohortIndex] = newCohort;
      this.props.onCohortsChange(prevCohorts);
      this.setState({ editingCohortIndex: undefined });
    }
  };

  private deleteCohort = (): void => {
    if (this.state.editingCohortIndex) {
      const prevCohorts = [...this.props.cohorts];
      prevCohorts.splice(this.state.editingCohortIndex, 1);
      this.props.onCohortsChange(prevCohorts);
      this.setState({ editingCohortIndex: undefined });
    }
  };

  private cloneAndEditCohort = (index: number): void => {
    const source = this.props.cohorts[index];
    const cohorts = [...this.props.cohorts];
    cohorts.push(
      new Cohort(
        source.name + localization.Interpret.CohortBanner.copy,
        this.props.jointDataset,
        [...source.filters]
      )
    );
    this.props.onCohortsChange(cohorts);
    this.setState({ editingCohortIndex: cohorts.length - 1 });
  };

  private closeCohortEditor = (): void => {
    this.setState({ editingCohortIndex: undefined });
  };

  private editCohort = (index: number): void => {
    this.setState({ editingCohortIndex: index });
  };
}
