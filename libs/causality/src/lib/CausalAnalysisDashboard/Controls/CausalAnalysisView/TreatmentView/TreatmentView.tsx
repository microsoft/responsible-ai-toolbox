// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICausalPolicy, NoData } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Stack, Text, Dropdown, IDropdownOption } from "office-ui-fabric-react";
import React, { FormEvent } from "react";

import { TreatmentBarChartSection } from "./TreatmentBarChartSection";
import { TreatmentListSection } from "./TreatmentListSection";
import { TreatmentStyles } from "./TreatmentStyles";
import { TreatmentTableSection } from "./TreatmentTableSection";

export interface ITreatmentViewProps {
  data?: ICausalPolicy[];
}
export interface ITreatmentViewState {
  selectedPolicy?: ICausalPolicy;
  dropdownOptions: IDropdownOption[];
}

export class TreatmentView extends React.Component<
  ITreatmentViewProps,
  ITreatmentViewState
> {
  public constructor(props: ITreatmentViewProps) {
    super(props);
    this.state = {
      dropdownOptions: props.data
        ? props.data.map((p, i) => ({
            key: i,
            selected: i === 0,
            text: p.treatment_feature
          }))
        : [],
      selectedPolicy: props.data?.[0]
    };
  }
  public render(): React.ReactNode {
    const styles = TreatmentStyles();
    return this.state.selectedPolicy ? (
      <Stack horizontal={false} grow tokens={{ padding: "l1" }}>
        <Text variant={"medium"} className={styles.label}>
          {localization.CausalAnalysis.TreatmentPolicy.Description}
        </Text>
        <Dropdown
          options={this.state.dropdownOptions}
          onChange={this.onSelect}
          label={localization.CausalAnalysis.TreatmentPolicy.SelectPolicy}
        />
        <TreatmentTableSection data={this.state.selectedPolicy} />
        <TreatmentBarChartSection data={this.state.selectedPolicy} />
        <TreatmentListSection data={this.state.selectedPolicy} />
      </Stack>
    ) : (
      <NoData />
    );
  }
  private onSelect = (
    _event: FormEvent<HTMLDivElement>,
    _option?: IDropdownOption | undefined,
    index?: number | undefined
  ): void => {
    if (index === undefined) {
      this.setState({
        selectedPolicy: undefined
      });
      return;
    }
    this.setState({
      selectedPolicy: this.props.data?.[index]
    });
  };
}
