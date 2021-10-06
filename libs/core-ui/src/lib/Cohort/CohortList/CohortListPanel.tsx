// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFocusTrapZoneProps, Panel } from "office-ui-fabric-react";
import React from "react";

import { ErrorCohort } from "../ErrorCohort";

import { CohortList } from "./CohortList";
import { cohortListStyles } from "./CohortList.styles";

export interface ICohortListPanelProps {
  isOpen: boolean;
  cohorts: ErrorCohort[];
  // hostId: string
  onDismiss: () => void;
  onEditCohortClick: (editedCohort: ErrorCohort) => void;
}

const focusTrapZoneProps: IFocusTrapZoneProps = {
  forceFocusInsideTrap: false,
  isClickableOutsideFocusTrap: true
};

export class CohortListPanel extends React.Component<ICohortListPanelProps> {
  public render(): React.ReactNode {
    const classNames = cohortListStyles();
    return (
      <Panel
        headerText="Cohort List"
        isOpen={this.props.isOpen}
        focusTrapZoneProps={focusTrapZoneProps}
        // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
        closeButtonAriaLabel="Close"
        isBlocking={false}
        onDismiss={this.props.onDismiss}
      >
        <div className={classNames.divider} />
        <CohortList
          errorCohorts={this.props.cohorts}
          onEditCohortClick={this.props.onEditCohortClick}
          includeDetails={false}
          enableEditing
        />
      </Panel>
    );
  }
}
