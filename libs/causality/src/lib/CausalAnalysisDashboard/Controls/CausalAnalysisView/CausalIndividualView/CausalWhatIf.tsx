// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ColumnCategories,
  defaultModelAssessmentContext,
  FabricStyles,
  ICausalWhatIfData,
  JointDataset,
  ModelAssessmentContext,
  NoData
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
  Slider,
  Stack,
  Text
} from "office-ui-fabric-react";
import React from "react";

import { causalIndividualChartStyles } from "./CausalIndividualChartStyles";
import { Outcome } from "./Outcome";

export interface ICausalWhatIfProps {
  selectedIndex: number | undefined;
}
interface ICausalWhatIfState {
  treatmentFeature?: string;
  currentTreatmentValue?: number;
  newTreatmentValue?: number;
  currentTreatmentRawValue?: string | number;
  newTreatmentRawValue?: string | number;
  treatmentValueMin?: number;
  treatmentValueMax?: number;
  treatmentValueStep?: number;
  currentOutcome?: ICausalWhatIfData;
  newOutcome?: ICausalWhatIfData;
}

export class CausalWhatIf extends React.Component<
  ICausalWhatIfProps,
  ICausalWhatIfState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;
  private _getWhatIfController: AbortController | undefined;
  public constructor(props: ICausalWhatIfProps) {
    super(props);
    this.state = {};
  }
  public componentDidUpdate(prev: ICausalWhatIfProps): void {
    if (prev.selectedIndex !== this.props.selectedIndex) {
      this.getWhatIf();
    }
  }
  public render(): React.ReactNode {
    if (!this.context.causalAnalysisData) {
      return <NoData />;
    }
    const treatmentOptions: IComboBoxOption[] = this.context.causalAnalysisData?.treatment_features.map(
      (n) => ({
        key: n,
        text: n
      })
    );

    const classNames = causalIndividualChartStyles();
    // if (this.context.dataset.task_type !== "regression") {
    //   return React.Fragment;
    // }
    return (
      <>
        <ComboBox
          label={localization.CausalAnalysis.IndividualView.selectTreatment}
          options={treatmentOptions}
          ariaLabel={"treatment picker"}
          useComboBoxAsMenuWidth
          styles={FabricStyles.smallDropdownStyle}
          selectedKey={this.state.treatmentFeature}
          onChange={this.setTreatmentFeature}
        />
        {this.state.currentTreatmentValue !== undefined && (
          <Text className={classNames.boldText}>
            {`${localization.CausalAnalysis.IndividualView.currentTreatment}: ${this.state.currentTreatmentRawValue}`}
          </Text>
        )}
        {!!this.state.treatmentValueMax && (
          <Stack>
            <Slider
              label={localization.CausalAnalysis.IndividualView.setNewTreatment}
              min={this.state.treatmentValueMin}
              step={this.state.treatmentValueStep}
              max={this.state.treatmentValueMax}
              defaultValue={this.state.newTreatmentValue}
              onChange={this.onTreatmentValueChange}
              showValue={false}
            />
            <Text>{this.state.newTreatmentRawValue}</Text>
            <Stack horizontal>
              <Outcome
                label={
                  localization.CausalAnalysis.IndividualView.currentOutcome
                }
                value={this.state.currentOutcome}
              />
              <Outcome
                label={localization.CausalAnalysis.IndividualView.newOutcome}
                value={this.state.newOutcome}
              />
            </Stack>
          </Stack>
        )}
      </>
    );
  }
  private readonly onTreatmentValueChange = (value: number): void => {
    if (!this.state.treatmentFeature) {
      return;
    }
    const featureKey =
      JointDataset.DataLabelRoot +
      this.context.dataset.feature_names.indexOf(this.state.treatmentFeature);
    this.setState(
      {
        newTreatmentRawValue: this.getRawValue(value, featureKey),
        newTreatmentValue: value
      },
      this.getWhatIf
    );
  };

  private readonly setTreatmentFeature = (
    _: React.FormEvent<IComboBox>,
    option?: IComboBoxOption | undefined
  ): void => {
    if (typeof option?.key !== "string") {
      return;
    }
    if (this.props.selectedIndex === undefined) {
      this.setState({
        treatmentFeature: undefined,
        treatmentValueMax: undefined,
        treatmentValueMin: undefined
      });
    }
    const featureKey =
      JointDataset.DataLabelRoot +
      this.context.dataset.feature_names.indexOf(option.key);
    const treatmentValue =
      this.props.selectedIndex === undefined
        ? undefined
        : this.context.selectedErrorCohort.cohort.filteredData[
            this.props.selectedIndex
          ][featureKey];
    const meta = this.context.jointDataset.metaDict[
      JointDataset.DataLabelRoot +
        this.context.dataset.feature_names.indexOf(option.key)
    ];
    let treatmentValueMin: number | undefined,
      treatmentValueMax: number | undefined,
      treatmentValueStep: number | undefined;
    if (this.context.dataset.categorical_features.includes(option.key)) {
      treatmentValueMin = 0;
      treatmentValueMax = meta.sortedCategoricalValues
        ? meta.sortedCategoricalValues.length - 1
        : 0;
      treatmentValueStep = 1;
    } else if (treatmentValue) {
      treatmentValueMin = treatmentValue * 0.9;
      treatmentValueMax = treatmentValue * 1.1;
      treatmentValueStep = treatmentValue * 0.01;
    }
    const rawValue = this.getRawValue(treatmentValue, featureKey);
    this.setState(
      {
        currentTreatmentRawValue: rawValue,
        currentTreatmentValue: treatmentValue,
        newTreatmentRawValue: rawValue,
        newTreatmentValue: treatmentValue,
        treatmentFeature: option.key,
        treatmentValueMax,
        treatmentValueMin,
        treatmentValueStep
      },
      this.getWhatIf
    );
  };

  private readonly getRawValue = (
    v: number | undefined,
    k: string
  ): string | number | undefined => {
    const meta = this.context.jointDataset.metaDict[k];
    if (v === undefined) {
      return v;
    }
    if (
      (meta.isCategorical || meta.treatAsCategorical) &&
      meta.sortedCategoricalValues
    ) {
      return meta.sortedCategoricalValues[v];
    }
    return v;
  };

  private readonly getWhatIf = async (): Promise<void> => {
    if (
      !this.context.causalAnalysisData ||
      !this.state.treatmentFeature ||
      this.props.selectedIndex === undefined ||
      this.state.newTreatmentValue === undefined ||
      !this.context.requestCausalWhatIf
    ) {
      return;
    }
    this.setState({
      currentOutcome: undefined,
      newOutcome: undefined
    });
    const data = _.chain(
      this.context.selectedErrorCohort.cohort.filteredData[
        this.props.selectedIndex
      ]
    )
      .pickBy(
        (_, k) =>
          this.context.jointDataset.metaDict[k]?.category ===
          ColumnCategories.Dataset
      )
      .mapValues(this.getRawValue)
      .mapKeys((_, k) => this.context.jointDataset.metaDict[k].label)
      .value();
    if (this._getWhatIfController) {
      this._getWhatIfController.abort();
    }
    this._getWhatIfController = new AbortController();
    const result = await this.context.requestCausalWhatIf(
      this.context.causalAnalysisData?.id,
      [data, data],
      this.state.treatmentFeature,
      [this.state.currentTreatmentRawValue, this.state.newTreatmentRawValue],
      [
        this.context.selectedErrorCohort.cohort.filteredData[
          this.props.selectedIndex
        ][JointDataset.TrueYLabel],
        this.context.selectedErrorCohort.cohort.filteredData[
          this.props.selectedIndex
        ][JointDataset.TrueYLabel]
      ],
      this._getWhatIfController.signal
    );
    this.setState({
      currentOutcome: result[0],
      newOutcome: result[1]
    });
  };
}
