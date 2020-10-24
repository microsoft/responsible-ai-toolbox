// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  DetailsList,
  IColumn,
  IconButton,
  Panel,
  SelectionMode,
  Stack,
  Text
} from "office-ui-fabric-react";
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
        fieldName: "name",
        key: "name",
        minWidth: 100,
        name: localization.Interpret.CohortBanner.name
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
            <Panel isOpen={true} onDismiss={this.hideEditList}>
              <DetailsList
                items={this.props.cohorts}
                selectionMode={SelectionMode.none}
                columns={columns}
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
        <Stack horizontal={true}>
          {index && (
            <IconButton
              iconProps={{
                iconName: "Edit"
              }}
              title={localization.Interpret.CohortBanner.editCohort}
              onClick={this.editCohort.bind(this, index)}
            />
          )}
          <IconButton
            iconProps={{
              iconName: "Copy"
            }}
            title={localization.Interpret.CohortBanner.duplicateCohort}
            onClick={this.cloneAndEditCohort.bind(this, index)}
          />
        </Stack>
      </Stack>
    );
  };
}
