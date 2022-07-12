// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Link, Stack, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { Cohort } from "../Cohort";

export interface ICohortNameProps {
  cohort: Cohort;
  index: number;
  cloneAndEditCohort(index: number): void;
  editCohort(index: number): void;
}

export class CohortName extends React.Component<ICohortNameProps> {
  public render(): React.ReactNode {
    return (
      <Stack>
        <Text>{this.props.cohort.name}</Text>
        <Stack horizontal tokens={{ childrenGap: "s1" }}>
          {this.props.index && (
            <Link onClick={this.onClickEditCohort}>
              {localization.Interpret.CohortBanner.editCohort}
            </Link>
          )}
          <Link onClick={this.onClickCloneAndEditCohort}>
            {localization.Interpret.CohortBanner.duplicateCohort}
          </Link>
        </Stack>
      </Stack>
    );
  }

  private onClickEditCohort = (): void => {
    this.props.editCohort(this.props.index);
  };

  private onClickCloneAndEditCohort = (): void => {
    this.props.cloneAndEditCohort(this.props.index);
  };
}
