// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { RangeTypes } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import {
  Text,
  PrimaryButton,
  Checkbox,
  ComboBox,
  IComboBox,
  IComboBoxOption,
  SpinButton,
  Panel,
  Stack,
  ChoiceGroup,
  IChoiceGroupOption,
  DefaultButton
} from "office-ui-fabric-react";
import { Position } from "office-ui-fabric-react/lib/utilities/positioning";
import React from "react";

import { cohortKey } from "../../cohortKey";
import { ColumnCategories, IJointMeta, JointDataset } from "../../JointDataset";
import { ISelectorConfig } from "../../NewExplanationDashboard";

export interface IAxisConfigProps {
  jointDataset: JointDataset;
  orderedGroupTitles: ColumnCategories[];
  selectedColumn: ISelectorConfig;
  canBin: boolean;
  mustBin: boolean;
  canDither: boolean;
  onAccept: (newConfig: ISelectorConfig) => void;
  onCancel: () => void;
}

export interface IAxisConfigState {
  selectedColumn: ISelectorConfig;
  binCount?: number;
  selectedFilterGroup?: string;
}

export class AxisConfigDialog extends React.PureComponent<
  IAxisConfigProps,
  IAxisConfigState
> {
  private static readonly MIN_HIST_COLS = 2;
  private static readonly MAX_HIST_COLS = 40;
  private static readonly DEFAULT_BIN_COUNT = 5;

  private readonly leftItems = [
    cohortKey,
    JointDataset.IndexLabel,
    JointDataset.DataLabelRoot,
    JointDataset.PredictedYLabel,
    JointDataset.TrueYLabel,
    JointDataset.ClassificationError,
    JointDataset.RegressionError,
    JointDataset.ProbabilityYRoot,
    ColumnCategories.None
  ].reduce((previousValue: Array<{ key: string; title: string }>, key) => {
    const metaVal = this.props.jointDataset.metaDict[key];
    if (
      key === JointDataset.DataLabelRoot &&
      this.props.orderedGroupTitles.includes(ColumnCategories.Dataset) &&
      this.props.jointDataset.hasDataset
    ) {
      previousValue.push({
        key,
        title: localization.Interpret.Columns.dataset
      });
      return previousValue;
    }
    if (
      key === JointDataset.ProbabilityYRoot &&
      this.props.orderedGroupTitles.includes(ColumnCategories.Outcome) &&
      this.props.jointDataset.hasPredictedProbabilities
    ) {
      previousValue.push({
        key,
        title: localization.Interpret.Columns.predictedProbabilities
      });
      return previousValue;
    }
    if (
      metaVal === undefined ||
      !this.props.orderedGroupTitles.includes(metaVal.category)
    ) {
      return previousValue;
    }

    previousValue.push({ key, title: metaVal.abbridgedLabel });
    return previousValue;
  }, []);

  private readonly dataArray: IComboBoxOption[] = new Array(
    this.props.jointDataset.datasetFeatureCount
  )
    .fill(0)
    .map((_, index) => {
      const key = JointDataset.DataLabelRoot + index.toString();
      return {
        key,
        text: this.props.jointDataset.metaDict[key].abbridgedLabel
      };
    });
  private readonly classArray: IComboBoxOption[] = new Array(
    this.props.jointDataset.predictionClassCount
  )
    .fill(0)
    .map((_, index) => {
      const key = JointDataset.ProbabilityYRoot + index.toString();
      return {
        key,
        text: this.props.jointDataset.metaDict[key].abbridgedLabel
      };
    });
  public constructor(props: IAxisConfigProps) {
    super(props);
    this.state = {
      binCount: this._getBinCountForProperty(
        this.props.selectedColumn.property
      ),
      selectedColumn: _.cloneDeep(this.props.selectedColumn),
      selectedFilterGroup: this.extractSelectionKey(
        this.props.selectedColumn.property
      )
    };
  }

  public render(): React.ReactNode {
    const selectedMeta = this.props.jointDataset.metaDict[
      this.state.selectedColumn.property
    ];
    const isDataColumn = this.state.selectedColumn.property.includes(
      JointDataset.DataLabelRoot
    );
    const isProbabilityColumn = this.state.selectedColumn.property.includes(
      JointDataset.ProbabilityYRoot
    );
    const minVal = this.getMinValue(selectedMeta);
    const maxVal = this.getMaxValue(selectedMeta);

    return (
      <Panel
        id="AxisConfigPanel"
        onDismiss={this.props.onCancel}
        isOpen={true}
        onRenderFooter={this.renderFooter}
        isFooterAtBottom
        isLightDismiss
      >
        <Stack tokens={{ childrenGap: "l1" }}>
          <Stack.Item>
            <ChoiceGroup
              label={localization.Interpret.AxisConfigDialog.selectFilter}
              options={this.leftItems.map((i) => ({
                key: i.key,
                text: i.title
              }))}
              onChange={this.filterGroupChanged}
              selectedKey={this.state.selectedFilterGroup}
            />
          </Stack.Item>
          {this.state.selectedColumn.property === cohortKey && (
            <Stack.Item>
              <Text>
                {localization.Interpret.AxisConfigDialog.groupByCohort}
              </Text>
            </Stack.Item>
          )}
          {this.state.selectedColumn.property === ColumnCategories.None && (
            <Stack.Item>
              <Text>
                {localization.Interpret.AxisConfigDialog.countHelperText}
              </Text>
            </Stack.Item>
          )}
          {this.state.selectedColumn.property !== cohortKey &&
            this.state.selectedColumn.property !== ColumnCategories.None && (
              <Stack>
                {isDataColumn && (
                  <ComboBox
                    options={this.dataArray}
                    onChange={this.setSelectedProperty}
                    label={
                      localization.Interpret.AxisConfigDialog.selectFeature
                    }
                    selectedKey={this.state.selectedColumn.property}
                  />
                )}
                {isProbabilityColumn && (
                  <ComboBox
                    options={this.classArray}
                    onChange={this.setSelectedProperty}
                    label={localization.Interpret.AxisConfigDialog.selectClass}
                    selectedKey={this.state.selectedColumn.property}
                  />
                )}
                {selectedMeta.featureRange?.rangeType ===
                  RangeTypes.Integer && (
                  <Checkbox
                    key={this.state.selectedColumn.property}
                    label={
                      localization.Interpret.AxisConfigDialog.TreatAsCategorical
                    }
                    checked={selectedMeta.treatAsCategorical}
                    onChange={this.setAsCategorical}
                  />
                )}
                {selectedMeta.treatAsCategorical ? (
                  <>
                    <Text variant={"small"}>
                      {`${localization.formatString(
                        localization.Interpret.Filters.uniqueValues,
                        selectedMeta.sortedCategoricalValues?.length
                      )}`}
                    </Text>
                    {this.props.canDither && (
                      <Checkbox
                        key={this.state.selectedColumn.property}
                        label={
                          localization.Interpret.AxisConfigDialog.ditherLabel
                        }
                        checked={this.state.selectedColumn.options.dither}
                        onChange={this.ditherChecked}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <Text variant={"small"} nowrap block>
                      {localization.formatString(
                        localization.Interpret.Filters.min,
                        minVal
                      )}
                    </Text>
                    <Text variant={"small"} nowrap block>
                      {localization.formatString(
                        localization.Interpret.Filters.max,
                        maxVal
                      )}
                    </Text>
                    {this.props.canBin && !this.props.mustBin && (
                      <Checkbox
                        key={this.state.selectedColumn.property}
                        label={localization.Interpret.AxisConfigDialog.binLabel}
                        checked={this.state.selectedColumn.options.bin}
                        onChange={this.shouldBinClicked}
                      />
                    )}
                    {(this.props.mustBin ||
                      this.state.selectedColumn.options.bin) &&
                      this.state.binCount !== undefined && (
                        <SpinButton
                          labelPosition={Position.top}
                          label={
                            localization.Interpret.AxisConfigDialog.numOfBins
                          }
                          min={AxisConfigDialog.MIN_HIST_COLS}
                          max={AxisConfigDialog.MAX_HIST_COLS}
                          value={this.state.binCount.toString()}
                          onIncrement={this.setNumericValue.bind(
                            this,
                            1,
                            selectedMeta
                          )}
                          onDecrement={this.setNumericValue.bind(
                            this,
                            -1,
                            selectedMeta
                          )}
                          onValidate={this.setNumericValue.bind(
                            this,
                            0,
                            selectedMeta
                          )}
                        />
                      )}
                    {!(
                      this.props.mustBin ||
                      this.state.selectedColumn.options.bin
                    ) &&
                      this.props.canDither && (
                        <Checkbox
                          key={this.state.selectedColumn.property}
                          label={
                            localization.Interpret.AxisConfigDialog.ditherLabel
                          }
                          checked={this.state.selectedColumn.options.dither}
                          onChange={this.ditherChecked}
                        />
                      )}
                  </>
                )}
              </Stack>
            )}
        </Stack>
      </Panel>
    );
  }

  private renderFooter = (): JSX.Element => {
    return (
      <Stack horizontal tokens={{ childrenGap: "l1", padding: "l1" }}>
        <PrimaryButton onClick={this.saveState}>
          {localization.Interpret.AxisConfigDialog.select}
        </PrimaryButton>
        <DefaultButton onClick={this.props.onCancel}>
          {localization.Interpret.CohortEditor.cancel}
        </DefaultButton>
      </Stack>
    );
  };

  private getMinValue(selectedMeta: IJointMeta): number | string {
    if (selectedMeta.treatAsCategorical || !selectedMeta.featureRange) {
      return 0;
    }
    if (Number.isInteger(selectedMeta.featureRange.min)) {
      return selectedMeta.featureRange.min;
    }
    return (Math.round(selectedMeta.featureRange.min * 10000) / 10000).toFixed(
      4
    );
  }

  private getMaxValue(selectedMeta: IJointMeta): number | string {
    if (selectedMeta.treatAsCategorical || !selectedMeta.featureRange) {
      return 0;
    }
    if (Number.isInteger(selectedMeta.featureRange.max)) {
      return selectedMeta.featureRange.max;
    }
    return (Math.round(selectedMeta.featureRange.max * 10000) / 10000).toFixed(
      4
    );
  }

  private extractSelectionKey(key: string): string {
    if (key === undefined) {
      return ColumnCategories.None;
    }
    if (key.includes(JointDataset.DataLabelRoot)) {
      return JointDataset.DataLabelRoot;
    }
    if (key.includes(JointDataset.ProbabilityYRoot)) {
      return JointDataset.ProbabilityYRoot;
    }
    return key;
  }

  private readonly setAsCategorical = (
    _ev?: React.FormEvent<HTMLElement>,
    checked?: boolean
  ): void => {
    if (checked === undefined) {
      return;
    }
    this.props.jointDataset.setTreatAsCategorical(
      this.state.selectedColumn.property,
      checked
    );
    this.setState({
      binCount: checked ? undefined : AxisConfigDialog.MIN_HIST_COLS
    });
    this.forceUpdate();
  };

  private readonly shouldBinClicked = (
    _ev?: React.FormEvent<HTMLElement>,
    checked?: boolean
  ): void => {
    if (checked === undefined) {
      return;
    }
    const property = this.state.selectedColumn.property;
    if (checked === false) {
      this.setState({
        binCount: undefined,
        selectedColumn: {
          options: {
            bin: checked
          },
          property
        }
      });
    } else {
      const binCount = this._getBinCountForProperty(property);
      this.setState({
        binCount,
        selectedColumn: {
          options: {
            bin: checked
          },
          property
        }
      });
    }
  };

  private readonly saveState = (): void => {
    if (this.state.binCount) {
      this.props.jointDataset.addBin(
        this.state.selectedColumn.property,
        this.state.binCount
      );
    }
    this.props.onAccept(this.state.selectedColumn);
  };

  private readonly ditherChecked = (
    _ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
    checked?: boolean
  ): void => {
    this.setState({
      selectedColumn: {
        options: {
          dither: checked
        },
        property: this.state.selectedColumn.property
      }
    });
  };

  private readonly setNumericValue = (
    delta: number,
    _column: IJointMeta,
    stringVal: string
  ): string | void => {
    if (delta === 0) {
      const number = +stringVal;
      if (
        !Number.isInteger(number) ||
        number > AxisConfigDialog.MAX_HIST_COLS ||
        number < AxisConfigDialog.MIN_HIST_COLS
      ) {
        return this.state.binCount?.toString();
      }
      this.setState({ binCount: number });
    } else {
      const prevVal = this.state.binCount as number;
      const newVal = prevVal + delta;
      if (
        newVal > AxisConfigDialog.MAX_HIST_COLS ||
        newVal < AxisConfigDialog.MIN_HIST_COLS
      ) {
        return prevVal.toString();
      }
      this.setState({ binCount: newVal });
    }
  };

  private setDefaultStateForKey(property: string): void {
    const dither =
      this.props.canDither &&
      this.props.jointDataset.metaDict[property].treatAsCategorical;
    const binCount = this._getBinCountForProperty(property);
    this.setState({
      binCount,
      selectedColumn: {
        options: {
          dither
        },
        property
      }
    });
  }

  private readonly filterGroupChanged = (
    _ev?: React.FormEvent<HTMLElement | HTMLInputElement> | undefined,
    option?: IChoiceGroupOption | undefined
  ): void => {
    if (typeof option?.key !== "string") {
      return;
    }
    this.setState({ selectedFilterGroup: option.key });
    let property = option.key;
    if (property === ColumnCategories.None) {
      this.setState({
        binCount: undefined,
        selectedColumn: {
          options: {
            dither: false
          },
          property
        }
      });
      return;
    }
    if (
      property === JointDataset.DataLabelRoot ||
      property === JointDataset.ProbabilityYRoot
    ) {
      property += "0";
    }
    this.setDefaultStateForKey(property);
  };

  private readonly setSelectedProperty = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (typeof item?.key === "string") {
      const property = item.key;
      this.setDefaultStateForKey(property);
    }
  };

  private _getBinCountForProperty(key: string): number | undefined {
    const selectedMeta = this.props.jointDataset.metaDict[key];
    let binCount = undefined;
    if (this.props.canBin && !selectedMeta.treatAsCategorical) {
      binCount =
        selectedMeta.sortedCategoricalValues !== undefined
          ? selectedMeta.sortedCategoricalValues.length
          : AxisConfigDialog.DEFAULT_BIN_COUNT;
    }
    return binCount;
  }
}
