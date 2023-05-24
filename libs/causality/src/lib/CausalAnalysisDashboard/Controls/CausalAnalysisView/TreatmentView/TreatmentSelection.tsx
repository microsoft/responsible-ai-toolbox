// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Dropdown, IDropdownOption } from "@fluentui/react";
import {
  ICausalPolicy,
  ITelemetryEvent,
  TelemetryEventName,
  TelemetryLevels
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React, { FormEvent } from "react";

import { TreatmentTableStyles } from "./TreatmentTable.styles";

export interface ITreatmentSelectionProps {
  data?: ICausalPolicy[];
  onSelect: (index: number) => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
}

interface ITreatmentSelectionState {
  dropdownOptions: IDropdownOption[];
}

export class TreatmentSelection extends React.Component<
  ITreatmentSelectionProps,
  ITreatmentSelectionState
> {
  public constructor(props: ITreatmentSelectionProps) {
    super(props);
    this.state = {
      dropdownOptions: props.data
        ? props.data.map((p, i) => ({
            key: i,
            selected: i === 0,
            text: p.treatment_feature
          }))
        : []
    };
  }
  public render(): React.ReactNode {
    const styles = TreatmentTableStyles();
    return (
      <Dropdown
        className={styles.dropdown}
        options={this.state.dropdownOptions}
        onChange={this.onSelect}
        label={localization.CausalAnalysis.TreatmentPolicy.SelectPolicy}
      />
    );
  }
  private onSelect = (
    _event: FormEvent<HTMLDivElement>,
    _option?: IDropdownOption | undefined,
    index?: number | undefined
  ): void => {
    if (index !== undefined) {
      this.props.onSelect(index);
      this.props.telemetryHook?.({
        level: TelemetryLevels.ButtonClick,
        type: TelemetryEventName.CausalTreatmentPolicyNewTreatmentFeatureSelected
      });
    }
  };
}
