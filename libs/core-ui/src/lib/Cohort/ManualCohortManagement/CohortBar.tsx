// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IColumn, Panel, SelectionMode, Stack, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { AccessibleDetailsList } from "../../components/AccessibleDetailsList";
import { ICohort } from "../../Interfaces/ICohort";
import { IExplanationModelMetadata } from "../../Interfaces/IExplanationContext";
import { JointDataset } from "../../util/JointDataset";
import { Cohort } from "../Cohort";

import { CohortEditor } from "./CohortEditor";
import { CohortList } from "./CohortList";
import { CohortName } from "./CohortName";

export interface ICohortBarProps {
  cohorts: Cohort[];
  jointDataset: JointDataset;
  modelMetadata: IExplanationModelMetadata;
  features: unknown[][] | undefined;
  onCohortsChange(cohorts: Cohort[]): void;
}
interface ICohortBarState {
  editingCohortIndex?: number;
  showEditPanel: boolean;
}

export class CohortBar extends React.Component<
  ICohortBarProps,
  ICohortBarState
> {
  public constructor(props: ICohortBarProps) {
    super(props);
    this.state = {
      editingCohortIndex: undefined,
      showEditPanel: false
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
    const columns: IColumn[] = [
      {
        key: "name",
        minWidth: 100,
        name: localization.Interpret.CohortBanner.name,
        onRender: this.renderCohortName
      },
      {
        key: "details",
        minWidth: 100,
        name: localization.Interpret.CohortBanner.details,
        onRender: this.renderDetails
      }
    ];
    return (
      <>
        <CohortList
          cohorts={this.props.cohorts}
          jointDataset={this.props.jointDataset}
          metadata={this.props.modelMetadata}
          addCohort={this.addCohort}
          showEditList={this.showEditList}
        />

        {this.state?.showEditPanel &&
          (cohortForEdit ? (
            <CohortEditor
              isFromExplanation
              metadata={this.props.modelMetadata}
              features={this.props.features}
              jointDataset={this.props.jointDataset}
              filterList={cohortForEdit.filterList}
              cohortName={cohortForEdit.cohortName}
              onSave={this.onCohortChange}
              closeCohortEditor={this.closeCohortEditor}
              closeCohortEditorPanel={this.closeCohortEditorPanel}
              onDelete={this.deleteCohort}
              isNewCohort={
                this.state.editingCohortIndex === this.props.cohorts.length
              }
              deleteIsDisabled={this.props.cohorts.length === 1}
            />
          ) : (
            <Panel isOpen onDismiss={this.hideEditList} isLightDismiss>
              <AccessibleDetailsList
                items={this.props.cohorts}
                selectionMode={SelectionMode.none}
                columns={columns}
                ariaLabel={localization.Core.ShiftCohort.cohortList}
              />
            </Panel>
          ))}
      </>
    );
  }
  private readonly showEditList = (): void => {
    this.setState({
      showEditPanel: true
    });
  };

  private readonly hideEditList = (): void => {
    this.setState({
      editingCohortIndex: undefined,
      showEditPanel: false
    });
  };

  private onCohortChange = (newCohort: Cohort): void => {
    if (this.state.editingCohortIndex !== undefined) {
      const isNew = this.state.editingCohortIndex === this.props.cohorts.length;
      const prevCohorts = [...this.props.cohorts];
      prevCohorts[this.state.editingCohortIndex] = newCohort;
      this.props.onCohortsChange(prevCohorts);
      this.setState({ editingCohortIndex: undefined, showEditPanel: !isNew });
    }
  };

  private deleteCohort = (): void => {
    if (this.state.editingCohortIndex !== undefined) {
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

  private closeCohortEditorPanel = (): void => {
    this.setState({ editingCohortIndex: undefined, showEditPanel: false });
  };

  private closeCohortEditor = (): void => {
    this.setState({ editingCohortIndex: undefined });
  };

  private addCohort = (): void => {
    this.setState({
      editingCohortIndex: this.props.cohorts.length,
      showEditPanel: true
    });
  };

  private editCohort = (index: number): void => {
    this.setState({ editingCohortIndex: index });
  };

  private renderCohortName = (
    cohort?: Cohort,
    index?: number
  ): React.ReactNode => {
    if (!cohort || index === undefined) {
      return <span />;
    }
    return (
      <CohortName
        cohort={cohort}
        index={index}
        cloneAndEditCohort={this.cloneAndEditCohort}
        editCohort={this.editCohort}
      />
    );
  };

  private renderDetails = (
    cohort?: Cohort,
    index?: number
  ): React.ReactNode => {
    if (!cohort || index === undefined) {
      return <span />;
    }
    return (
      <Stack>
        <Text variant={"xSmall"}>
          {localization.formatString(
            localization.Interpret.CohortBanner.datapoints,
            cohort.filteredData.length
          )}
        </Text>
        <Text variant={"xSmall"}>
          {localization.formatString(
            localization.Interpret.CohortBanner.filters,
            cohort.filters.length
          )}
        </Text>
      </Stack>
    );
  };
}
