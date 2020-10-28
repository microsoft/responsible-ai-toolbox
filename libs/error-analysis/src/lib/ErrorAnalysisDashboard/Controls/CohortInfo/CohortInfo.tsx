// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFocusTrapZoneProps } from "office-ui-fabric-react";
import { Panel } from "office-ui-fabric-react/lib/Panel";
import React from "react";

import { cohortInfoStyles } from "./CohortInfo.styles";

export interface ICohortInfoProps {
  isOpen: boolean;
  // hostId: string
  onDismiss: () => void;
}

const focusTrapZoneProps: IFocusTrapZoneProps = {
  forceFocusInsideTrap: false,
  isClickableOutsideFocusTrap: true
};

export class CohortInfo extends React.PureComponent<ICohortInfoProps> {
  public render(): React.ReactNode {
    const classNames = cohortInfoStyles();
    return (
      <Panel
        headerText="Cohort Information"
        isOpen={this.props.isOpen}
        focusTrapZoneProps={focusTrapZoneProps}
        // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
        closeButtonAriaLabel="Close"
        // layerProps={{ hostId: this.props.hostId }}
        isBlocking={false}
        onDismiss={this.props.onDismiss}
      >
        <div className={classNames.divider}></div>
        <div className={classNames.section}>
          <div className={classNames.subsection}>
            <div className={classNames.header}>Current cohort</div>
            <div>All Data (Treemap)</div>
          </div>
        </div>
        <div className={classNames.divider}></div>
        <div className={classNames.section}>
          <div className={classNames.subsection}>
            <div className={classNames.header}>Overview</div>
            <div className="padding-top-xsm">
              <div className="coverage">
                <div className="flex-container">
                  <div className="metric padding-top-xsm">
                    <div className="font-size-20 semibold">{5.5}</div>
                    <div className="font-size-12 text-grey">Coverage(%)</div>
                  </div>
                  {/* <img src={CoverageImg} className="legned" alt=""/> */}
                </div>
              </div>
              <div className="errorRate marginTop-sm">
                <div className="flex-container">
                  <div className="metric padding-top-xsm">
                    <div className="font-size-20 semibold">{5.5}</div>
                    <div className="font-size-12 text-grey">Error Rate(%)</div>
                  </div>
                  {/* <img src={ErrorRateImg} className="legned" alt=""/> */}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={classNames.divider}></div>
        <div className={classNames.section}>
          <div className={classNames.subsection}>
            <div className={classNames.header}>Prediction path</div>
            <div>TBD</div>
          </div>
        </div>
        <div className={classNames.divider}></div>
        <div className={classNames.section}>
          <div className={classNames.subsection}>
            <div className={classNames.header}>
              Feature importance (Error rates)
            </div>
            <div>TBD</div>
          </div>
        </div>
      </Panel>
    );
  }
}
