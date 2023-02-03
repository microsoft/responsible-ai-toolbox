// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IComboBox,
  ComboBox,
  Slider,
  Stack,
  Text
} from "@fluentui/react";
import {
  ColumnCategories,
  FluentUIStyles,
  ICausalWhatIfData,
  JointDataset,
  ModelAssessmentContext,
  NoData,
  defaultModelAssessmentContext,
  DatasetTaskType,
  ifEnableLargeData
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

import { causalWhatIfStyles } from "./CausalWhatIf.styles";
import { Outcome } from "./Outcome";

export interface ICausalWhatIfProps {
  selectedIndex: number | undefined;
  absoluteIndex?: number;
  isLocalCausalDataLoading?: boolean;
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
  currentOutcome?: number;
  newOutcome?: ICausalWhatIfData;
  testDataRow?: any;
}

export class CausalWhatIf extends React.Component<
  ICausalWhatIfProps,
  ICausalWhatIfState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private _getWhatIfController: AbortController | undefined;
  public constructor(props: ICausalWhatIfProps) {
    super(props);
    this.state = {};
  }
  public componentDidUpdate(prev: ICausalWhatIfProps): void {
    if (prev.selectedIndex !== this.props.selectedIndex) {
      this.setTreatmentFeature();
    }
  }
  public render(): React.ReactNode {
    if (this.context.dataset.task_type !== DatasetTaskType.Regression) {
      return React.Fragment;
    }
    if (!this.context.causalAnalysisData?.config) {
      return <NoData />;
    }
    const treatmentOptions: IComboBoxOption[] =
      this.context.causalAnalysisData?.config?.treatment_features.map((n) => ({
        key: n,
        text: n
      }));

    const classNames = causalWhatIfStyles();
    console.log("!!values: ", this.context.dataset.target_column);
    return (
      <>
        <ComboBox
          label={localization.CausalAnalysis.IndividualView.selectTreatment}
          options={treatmentOptions}
          ariaLabel={"treatment picker"}
          useComboBoxAsMenuWidth
          styles={FluentUIStyles.smallDropdownStyle}
          selectedKey={this.state.treatmentFeature}
          onChange={this.setTreatmentFeature}
          disabled={this.props.isLocalCausalDataLoading}
        />
        {this.state.currentTreatmentValue !== undefined && (
          <Text className={classNames.boldText}>
            {`${localization.CausalAnalysis.IndividualView.currentTreatment}: ${this.state.currentTreatmentRawValue}`}
          </Text>
        )}
        {!!this.state.treatmentValueMax && (
          <Stack tokens={{ childrenGap: "l1" }}>
            <Stack.Item>
              <Slider
                label={
                  localization.CausalAnalysis.IndividualView.setNewTreatment
                }
                min={this.state.treatmentValueMin}
                step={this.state.treatmentValueStep}
                max={this.state.treatmentValueMax}
                value={this.state.newTreatmentValue}
                onChange={this.onTreatmentValueChange}
                valueFormat={this.showNewTreatmentRawValue}
                disabled={!this.context.requestCausalWhatIf}
              />
              <Text variant="small" className={classNames.treatmentValue}>
                {localization.formatString(
                  localization.CausalAnalysis.IndividualView.treatmentValue,
                  this.state.treatmentValueMin,
                  "-10%",
                  this.state.treatmentValueMax,
                  "+10%"
                )}
              </Text>
            </Stack.Item>
            <Stack.Item>
              <Stack horizontal tokens={{ childrenGap: "l1" }}>
                <Stack.Item className={classNames.currentOutcome}>
                  <Outcome
                    label={
                      localization.CausalAnalysis.IndividualView.currentOutcome
                    }
                    value={this.state.currentOutcome}
                  />
                </Stack.Item>
                {this.context.requestCausalWhatIf !== undefined && (
                  <Stack.Item className={classNames.newOutcome}>
                    <Outcome
                      label={
                        localization.CausalAnalysis.IndividualView.newOutcome
                      }
                      value={this.state.newOutcome?.point_estimate}
                      lower={this.state.newOutcome?.ci_lower}
                      upper={this.state.newOutcome?.ci_upper}
                    />
                  </Stack.Item>
                )}
              </Stack>
            </Stack.Item>
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
        newTreatmentRawValue: this.context.jointDataset.getRawValue(
          value,
          featureKey
        ),
        newTreatmentValue: value
      },
      this.getWhatIf
    );
  };

  private readonly showNewTreatmentRawValue = (): string => {
    return `${this.state.newTreatmentRawValue}`;
  };

  private readonly setTreatmentFeature = async (
    _?: React.FormEvent<IComboBox>,
    option?: IComboBoxOption | undefined
  ): Promise<void> => {
    let featureName = this.state.treatmentFeature;
    if (typeof option?.key === "string") {
      featureName = option.key;
    }
    if (!featureName) {
      return;
    }
    if (this.props.selectedIndex === undefined) {
      this.setState({
        currentOutcome: undefined,
        treatmentFeature: undefined,
        treatmentValueMax: undefined,
        treatmentValueMin: undefined
      });
      return;
    }
    const featureKey =
      JointDataset.DataLabelRoot +
      this.context.dataset.feature_names.indexOf(featureName);
    let treatmentValue = this.context.selectedErrorCohort.cohort.getRow(
      this.props.selectedIndex
    )[featureKey];

    if (ifEnableLargeData(this.context.dataset)) {
      await this.getTestDataRow();
      treatmentValue = this.getLargeDataTreatmentValue(featureName) ?? 0;
    }

    const meta =
      this.context.jointDataset.metaDict[
        JointDataset.DataLabelRoot +
          this.context.dataset.feature_names.indexOf(featureName)
      ];
    let treatmentValueMin: number | undefined,
      treatmentValueMax: number | undefined,
      treatmentValueStep: number | undefined;
    if (this.context.dataset.categorical_features.includes(featureName)) {
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
    const rawValue = this.context.jointDataset.getRawValue(
      treatmentValue,
      featureKey
    );
    const targetColumn = this.getTargetColumn();
    const currentOutcome =
      ifEnableLargeData(this.context.dataset) && targetColumn
        ? this.state.testDataRow[targetColumn]
        : this.context.selectedErrorCohort.cohort.getRow(
            this.props.selectedIndex
          )[JointDataset.TrueYLabel];
    this.setState(
      {
        currentOutcome: currentOutcome,
        currentTreatmentRawValue: rawValue,
        currentTreatmentValue: treatmentValue,
        newTreatmentRawValue: rawValue,
        newTreatmentValue: treatmentValue,
        treatmentFeature: featureName,
        treatmentValueMax,
        treatmentValueMin,
        treatmentValueStep
      },
      this.getWhatIf
    );
  };

  private readonly getLargeDataTreatmentValue = (
    featureName?: string
  ): number | undefined => {
    if (!this.state.testDataRow || !featureName) {
      return;
    }
    return this.state.testDataRow[featureName];
  };

  private readonly getTargetColumn = (): string | undefined => {
    const targetColumn = Array.isArray(this.context.dataset.target_column)
      ? this.context.dataset.target_column?.[0]
      : this.context.dataset.target_column;
    return targetColumn;
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
      newOutcome: undefined
    });
    const data = this.getFeaturesData();
    const targetColumn = this.getTargetColumn();
    const targetValue =
      ifEnableLargeData(this.context.dataset) && targetColumn
        ? this.state.testDataRow[targetColumn]
        : this.context.selectedErrorCohort.cohort.getRow(
            this.props.selectedIndex
          )[JointDataset.TrueYLabel];
    if (this._getWhatIfController) {
      this._getWhatIfController.abort();
    }
    this._getWhatIfController = new AbortController();
    const result = await this.context.requestCausalWhatIf(
      this.context.causalAnalysisData?.id,
      [data],
      this.state.treatmentFeature,
      [this.state.newTreatmentRawValue],
      [targetValue],
      this._getWhatIfController.signal
    );
    this.setState({
      newOutcome: result[0]
    });
  };

  private readonly getFeaturesData = ():
    | _.Dictionary<string | number | undefined>
    | undefined => {
    if (!this.props.selectedIndex) {
      return;
    }
    let data;
    if (!ifEnableLargeData(this.context.dataset)) {
      data = _.chain(
        this.context.selectedErrorCohort.cohort.getRow(this.props.selectedIndex)
      )
        .pickBy(
          (_, k) =>
            this.context.jointDataset.metaDict[k]?.category ===
            ColumnCategories.Dataset
        )
        .mapValues(this.context.jointDataset.getRawValue)
        .mapKeys((_, k) => this.context.jointDataset.metaDict[k].label)
        .value();
    } else {
      const tempTestDataRow = _.cloneDeep(this.state.testDataRow);
      const targetColumn = this.getTargetColumn();
      if (targetColumn && tempTestDataRow.hasOwnProperty(targetColumn)) {
        delete tempTestDataRow[targetColumn];
      }
      data = tempTestDataRow;
    }
    return data;
  };

  private readonly getTestDataRow = async (): Promise<any> => {
    if (!this.context.requestTestDataRow || !this.props.absoluteIndex) {
      return;
    }
    this.setState({
      testDataRow: undefined
    });
    try {
      const result = await this.context.requestTestDataRow?.(
        this.props.absoluteIndex,
        new AbortController().signal
      );
      this.setState({
        testDataRow: JSON.parse(result)[0]
      });
    } catch (error) {}
  };
}
