// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IComboBox,
  ComboBox,
  DetailsRow,
  IColumn,
  IDetailsFooterProps,
  SelectionMode,
  Stack,
  Text,
  TextField
} from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ICounterfactualData,
  JointDataset,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import React from "react";

import { getCategoricalOption } from "../util/getCategoricalOption";
import { getTargetFeatureName } from "../util/getTargetFeatureName";

import { counterfactualListStyle } from "./CounterfactualList.styles";

export interface ICounterfactualListDetailsFooterProps {
  data?: ICounterfactualData;
  detailsFooterProps?: IDetailsFooterProps;
  itemColumnData: Record<string, string | number>;
  originalData: { [key: string]: string | number };
  temporaryPoint: Record<string, string | number> | undefined;
  updateColValue: (
    evt: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ) => void;
  updateComboBoxColValue: (
    key: string | number,
    options: IComboBoxOption[],
    _event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption
  ) => void;
}

export class CounterfactualListDetailsFooter extends React.Component<ICounterfactualListDetailsFooterProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    if (this.props.detailsFooterProps && this.context.requestPredictions) {
      const classNames = counterfactualListStyle();
      return (
        <DetailsRow
          styles={{ root: classNames.highlightRow }}
          {...this.props.detailsFooterProps}
          columns={this.props.detailsFooterProps.columns}
          item={this.props.itemColumnData}
          itemIndex={-1}
          groupNestingDepth={this.props.detailsFooterProps.groupNestingDepth}
          selectionMode={SelectionMode.none}
          onRenderItemColumn={this.renderDetailsFooterItemColumn}
        />
      );
    }
    return <div />;
  }

  private renderDetailsFooterItemColumn = (
    _item: Record<string, string | number>,
    _index?: number,
    column?: IColumn
  ): React.ReactNode | undefined => {
    const dropdownOption = getCategoricalOption(
      this.context.jointDataset,
      column?.key
    );
    const styles = counterfactualListStyle();
    const targetFeature = getTargetFeatureName(this.props.data);
    if (column && targetFeature && column.fieldName === targetFeature) {
      const predictedClass = this.context.jointDataset.hasPredictedY
        ? this.props.temporaryPoint?.[JointDataset.PredictedYLabel]
        : undefined;
      return (
        <Stack horizontal={false} tokens={{ childrenGap: "s1" }}>
          <Stack.Item className={styles.dropdownLabel}>
            <Text>{column.name}</Text>
          </Stack.Item>
          <Stack.Item>
            <Text className={`predictedValue ${styles.bottomRowText}`}>
              {predictedClass}
            </Text>
          </Stack.Item>
        </Stack>
      );
    }
    let inputTextStyles;
    if (column) {
      // input text should be bolded if the value has changed from original reference value
      inputTextStyles =
        this.props.itemColumnData[column.key]?.toString() !==
        this.props.originalData[column.key]?.toString()
          ? styles.bottomRowText
          : undefined;
    }
    if (column && dropdownOption?.data?.categoricalOptions) {
      return (
        <Stack horizontal={false} tokens={{ childrenGap: "s1" }}>
          <Stack.Item className={styles.dropdownLabel}>
            <Text>{column.key}</Text>
          </Stack.Item>
          <Stack.Item>
            <ComboBox
              key={`${column.key}`}
              autoComplete={"on"}
              ariaLabel={column.key}
              allowFreeform
              selectedKey={`${this.props.itemColumnData[column.key]}`}
              options={dropdownOption.data.categoricalOptions}
              onChange={(
                _event: React.FormEvent<IComboBox>,
                option?: IComboBoxOption
              ): void =>
                this.props.updateComboBoxColValue(
                  column.key,
                  dropdownOption.data.categoricalOptions,
                  _event,
                  option
                )
              }
              styles={{
                input: inputTextStyles
              }}
            />
          </Stack.Item>
        </Stack>
      );
    }
    if (column) {
      return (
        <Stack horizontal={false}>
          <Stack.Item>
            <TextField
              value={this.props.itemColumnData[column.key]?.toString()}
              label={column.name || column.key}
              inputClassName={inputTextStyles}
              id={column.key}
              onChange={this.props.updateColValue}
            />
          </Stack.Item>
        </Stack>
      );
    }
    return undefined;
  };
}
