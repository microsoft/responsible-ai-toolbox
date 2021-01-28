// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JointDataset } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import {
  DefaultButton,
  IFocusTrapZoneProps,
  IPanelProps,
  IPanelStyles,
  IStackTokens,
  IStyleFunctionOrObject,
  Panel,
  Stack
} from "office-ui-fabric-react";
import React from "react";

import { ErrorCohort } from "../../ErrorCohort";
import { PredictionPath } from "../PredictionPath/PredictionPath";

import { cohortInfoStyles } from "./CohortInfo.styles";

export interface ICohortInfoProps {
  isOpen: boolean;
  currentCohort: ErrorCohort;
  jointDataset: JointDataset;
  // hostId: string
  onDismiss: () => void;
  onSaveCohortClick: () => void;
}

const focusTrapZoneProps: IFocusTrapZoneProps = {
  forceFocusInsideTrap: false,
  isClickableOutsideFocusTrap: true
};

const alignmentStackTokens: IStackTokens = {
  childrenGap: 5,
  padding: 2
};

const panelStyles: IStyleFunctionOrObject<IPanelProps, IPanelStyles> = {
  main: { zIndex: 1 }
};

export class CohortInfo extends React.PureComponent<ICohortInfoProps> {
  public render(): React.ReactNode {
    const classNames = cohortInfoStyles();

    return (
      <Panel
        headerText={localization.ErrorAnalysis.CohortInfo.cohortInformation}
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
        <div className={classNames.section}>
          <div className={classNames.subsection}>
            <DefaultButton
              text={localization.ErrorAnalysis.CohortInfo.saveCohort}
              onClick={(): any => this.props.onSaveCohortClick()}
            />
          </div>
          <div className={classNames.section}></div>
          <div className={classNames.subsection}>
            <div className={classNames.header}>Basic Information</div>
            {this.props.currentCohort.cohort.name !== "All data" && (
              <div>{this.props.currentCohort.cohort.name}</div>
            )}
            <div>
              All data ({this.props.currentCohort.cohort.filters.length}{" "}
              filters)
            </div>
          </div>
        </div>
        <div className={classNames.divider}></div>
        <div className={classNames.section}>
          <div className={classNames.subsection}>
            <div>Instances in base cohort</div>
            <Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>Total</div>
                <div className={classNames.tableData}>
                  {this.props.currentCohort.totalAll}
                </div>
              </Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>Correct</div>
                <div className={classNames.tableData}>
                  {this.props.currentCohort.totalCorrect}
                </div>
              </Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>Incorrect</div>
                <div className={classNames.tableData}>
                  {this.props.currentCohort.totalIncorrect}
                </div>
              </Stack>
            </Stack>
          </div>
        </div>
        <div className={classNames.section}>
          <div className={classNames.subsection}>
            <div>Instances in the selected cohort</div>
            <Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>Total</div>
                <div className={classNames.tableData}>
                  {this.props.currentCohort.totalCohort}
                </div>
              </Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>Correct</div>
                <div className={classNames.tableData}>
                  {this.props.currentCohort.totalCohortCorrect}
                </div>
              </Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>Incorrect</div>
                <div className={classNames.tableData}>
                  {this.props.currentCohort.totalCohortIncorrect}
                </div>
              </Stack>
            </Stack>
          </div>
        </div>
        <div className={classNames.divider}></div>
        <div className={classNames.section}>
          <div className={classNames.subsection}>
            <div className={classNames.header}>Prediction path (filters)</div>
            <PredictionPath temporaryCohort={this.props.currentCohort} />
          </div>
        </div>
      </Panel>
    );
  }
}
