// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Stack,
  PrimaryButton,
  DefaultButton,
  Dialog,
  DialogType,
  DialogFooter,
  TextField,
  Text
} from "@fluentui/react";
import { ErrorCohort } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { visionExplanationDashboardStyles } from "../VisionExplanationDashboard.styles";

export interface ICohortToolBarProps {
  addCohort: (name: string, switchCohort: boolean) => void;
  cohorts: ErrorCohort[];
  selectedIndices: number[];
}

export interface ICohortToolBarState {
  cohortNames: string[];
  selectionCount: number;
  hideSaveCohortDialog: boolean;
  newCohortName: string;
  errorMessage: string;
}

const dialogContentProps = {
  closeButtonAriaLabel: localization.InterpretVision.Cohort.close,
  title: localization.InterpretVision.Cohort.title,
  type: DialogType.normal
};

const stackTokens = {
  childrenGap: "l1"
};

export class CohortToolBar extends React.Component<
  ICohortToolBarProps,
  ICohortToolBarState
> {
  public constructor(props: ICohortToolBarProps) {
    super(props);
    this.state = {
      cohortNames: [],
      errorMessage: "",
      hideSaveCohortDialog: true,
      newCohortName: "",
      selectionCount: 0
    };
  }

  public componentDidMount(): void {
    const cohortNames: string[] = [];
    this.props.cohorts.forEach((cohort: ErrorCohort) => {
      cohortNames.push(cohort.cohort.name.toLowerCase());
    });
    const selectionCount: number = this.props.selectedIndices.length;
    this.setState({ cohortNames, selectionCount });
  }

  public componentDidUpdate(prevProps: ICohortToolBarProps): void {
    if (prevProps.selectedIndices !== this.props.selectedIndices) {
      this.setState({ selectionCount: this.props.selectedIndices.length });
    }
    if (prevProps.cohorts !== this.props.cohorts) {
      const cohortNames: string[] = [];
      this.props.cohorts.forEach((cohort: ErrorCohort) => {
        cohortNames.push(cohort.cohort.name.toLowerCase());
      });
      this.setState({ cohortNames });
    }
  }

  public render(): React.ReactNode {
    const classNames = visionExplanationDashboardStyles();
    return (
      <Stack>
        <Stack horizontal tokens={stackTokens}>
          <Stack.Item className={classNames.itemsSelectedContainer}>
            <Text>
              {this.state.selectionCount}{" "}
              {this.state.selectionCount === 1
                ? localization.InterpretVision.Cohort.itemsSelectedSingular
                : localization.InterpretVision.Cohort.itemsSelectedPlural}
            </Text>
          </Stack.Item>
          <Stack.Item>
            <PrimaryButton
              text={localization.InterpretVision.Cohort.save}
              onClick={this.openDialogue}
            />
          </Stack.Item>
        </Stack>
        <Stack.Item>
          <Dialog
            hidden={this.state.hideSaveCohortDialog}
            onDismiss={this.hideDialogue}
            dialogContentProps={dialogContentProps}
          >
            <Stack tokens={stackTokens}>
              <Stack.Item>
                <TextField
                  label={localization.InterpretVision.Cohort.textField}
                  value={this.state.newCohortName}
                  onChange={this.onChangeNewCohortName}
                />
              </Stack.Item>
              {this.state.errorMessage !== "" && (
                <Stack.Item>
                  <Text
                    className={classNames.errorMessage}
                    variant="mediumPlus"
                  >
                    {this.state.errorMessage}
                  </Text>
                </Stack.Item>
              )}
              <Stack.Item>
                <DialogFooter>
                  <PrimaryButton
                    onClick={this.addCohortWrapper(true)}
                    text={localization.InterpretVision.Cohort.saveAndSwitch}
                  />
                  <DefaultButton
                    onClick={this.addCohortWrapper(false)}
                    text={localization.InterpretVision.Cohort.saveAndClose}
                  />
                </DialogFooter>
              </Stack.Item>
            </Stack>
          </Dialog>
        </Stack.Item>
      </Stack>
    );
  }

  private openDialogue = (): void => {
    this.setState({ hideSaveCohortDialog: false });
  };

  private hideDialogue = (): void => {
    this.setState({ hideSaveCohortDialog: true });
  };

  private onChangeNewCohortName = (
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    this.setState({ newCohortName: newValue || "" });
  };

  private addCohortWrapper = (switchCohort: boolean) => (): void => {
    let cohortName = this.state.newCohortName;
    if (cohortName.length === 0) {
      cohortName = `Cohort ${this.state.cohortNames.length + 1}`;
    }
    if (this.state.selectionCount === 0) {
      this.setState({
        errorMessage: localization.InterpretVision.Cohort.errorNumSelected
      });
    } else if (this.state.cohortNames.includes(cohortName.toLowerCase())) {
      this.setState({
        errorMessage: localization.InterpretVision.Cohort.errorCohortName
      });
    } else {
      this.setState({ hideSaveCohortDialog: true });
      this.setState({ errorMessage: "" });
      this.setState({ newCohortName: "" });
      this.props.addCohort(cohortName, switchCohort);
    }
  };
}
