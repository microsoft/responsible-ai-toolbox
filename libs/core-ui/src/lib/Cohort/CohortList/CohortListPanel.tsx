// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IFocusTrapZoneProps,
  IPanelProps,
  IPanelStyles,
  IStyleFunctionOrObject,
  Panel
} from "office-ui-fabric-react";
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

const panelStyles: IStyleFunctionOrObject<IPanelProps, IPanelStyles> = {
  main: { zIndex: 1 }
};

export class CohortListPanel extends React.Component<ICohortListPanelProps> {
  public constructor(props: ICohortListPanelProps) {
    super(props);
  }

  public render(): React.ReactNode {
    let classNames = cohortListStyles();
    return (
      <Panel
        headerText="Cohort List"
        isOpen={this.props.isOpen}
        focusTrapZoneProps={focusTrapZoneProps}
        // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
        closeButtonAriaLabel="Close"
        // layerProps={{ hostId: this.props.hostId }}
        isBlocking={false}
        onDismiss={this.props.onDismiss}
        styles={panelStyles}
      >
        <div className={classNames.divider}></div>
        <CohortList
          errorCohorts={this.props.cohorts}
          onEditCohortClick={this.props.onEditCohortClick}
          includeDetails={false}
          enableEditing={true}
        />
      </Panel>
    );
  }
}
