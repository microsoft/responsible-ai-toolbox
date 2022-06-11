// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFocusTrapZoneProps, Panel } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { ErrorCohort } from "../ErrorCohort";

import { CohortInfo } from "./CohortInfo";

export interface ICohortInfoPanelProps {
  isOpen: boolean;
  currentCohort: ErrorCohort;
  onDismiss: () => void;
  onSaveCohortClick: () => void;
}

const focusTrapZoneProps: IFocusTrapZoneProps = {
  forceFocusInsideTrap: false,
  isClickableOutsideFocusTrap: true
};

export class CohortInfoPanel extends React.PureComponent<ICohortInfoPanelProps> {
  public render(): React.ReactNode {
    return (
      <Panel
        headerText={localization.ErrorAnalysis.CohortInfo.cohortInformation}
        isOpen={this.props.isOpen}
        focusTrapZoneProps={focusTrapZoneProps}
        // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
        closeButtonAriaLabel="Close"
        isBlocking={false}
        onDismiss={this.props.onDismiss}
      >
        <CohortInfo
          currentCohort={this.props.currentCohort}
          disabledView={false}
          onSaveCohortClick={this.props.onSaveCohortClick}
        />
      </Panel>
    );
  }
}
