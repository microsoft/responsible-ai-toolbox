// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  FabricStyles,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  ComboBox,
  IComboBoxOption,
  Slider,
  Text
} from "office-ui-fabric-react";
import React from "react";

import { causalIndividualChartStyles } from "./CausalIndividualChartStyles";

export interface ICausalWhatIfProps {}
interface ICausalWhatIfState {
  treatmentFeature?: string;
  treatmentValue?: string;
}

export class CausalWhatIf extends React.Component<
  ICausalWhatIfProps,
  ICausalWhatIfState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;
  public render(): React.ReactNode {
    const treatmentOptions: IComboBoxOption[] = this.context.dataset.feature_names.map(
      (n) => ({
        key: n,
        text: n
      })
    );

    const classNames = causalIndividualChartStyles();
    return (
      <>
        <ComboBox
          label={localization.CausalAnalysis.IndividualView.selectTreatment}
          options={treatmentOptions}
          ariaLabel={"treatment picker"}
          useComboBoxAsMenuWidth
          styles={FabricStyles.smallDropdownStyle}
          onChange={this.setTreatmentFeature}
        />
        <Text className={classNames.boldText}>
          {`${localization.CausalAnalysis.IndividualView.currentTreatment}: ${this.state.treatmentValue}`}
        </Text>
        <Slider
          label={localization.CausalAnalysis.IndividualView.setNewTreatment}
          min={0}
          max={100}
          step={5}
          defaultValue={20}
          showValue
          snapToStep
        />
      </>
    );
  }

  private readonly setTreatmentFeature = (
    _: FormEvent<IComboBox>,
    option?: IComboBoxOption | undefined
  ): void => {
    if (typeof option?.key !== "string") {
      return;
    }
    this.setState({
      treatmentFeature: option.key
    });
  };

  private readonly getWhatIf = (
    _: FormEvent<IComboBox>,
    option?: IComboBoxOption | undefined
  ): void => {
    if (!this.state.treatmentFeature) {
      return;
    }
    this.setState({
      treatmentFeature: option.key
    });
  };
}
