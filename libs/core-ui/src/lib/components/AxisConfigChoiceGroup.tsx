// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ChoiceGroup, IChoiceGroupOption } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

import { cohortKey } from "../cohortKey";
import { ISelectorConfig } from "../util/IGenericChartProps";
import { ColumnCategories, JointDataset } from "../util/JointDataset";

import { getBinCountForProperty } from "./AxisConfigDialogUtils";

export interface IAxisConfigChoiceGroupProps {
  canBin: boolean;
  canDither: boolean;
  defaultBinCount: number;
  jointDataset: JointDataset;
  mustBin: boolean;
  orderedGroupTitles: ColumnCategories[];
  selectedFilterGroup?: string;
  onBinCountUpdated: (binCount?: number) => void;
  onSelectedColumnUpdated: (selectedColumn: ISelectorConfig) => void;
  onSelectedFilterGroupUpdated: (selectedFilterGroup?: string) => void;
}

export class AxisConfigChoiceGroup extends React.PureComponent<IAxisConfigChoiceGroupProps> {
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

  public render(): React.ReactNode {
    return (
      <ChoiceGroup
        label={localization.Interpret.AxisConfigDialog.selectFilter}
        options={this.leftItems.map((i) => ({
          key: i.key,
          text: i.title
        }))}
        onChange={this.filterGroupChanged}
        selectedKey={this.props.selectedFilterGroup}
      />
    );
  }

  private setDefaultStateForKey(property: string): void {
    const dither =
      this.props.canDither &&
      this.props.jointDataset.metaDict[property]?.treatAsCategorical;
    const binCount = getBinCountForProperty(
      this.props.jointDataset.metaDict[property],
      this.props.canBin,
      this.props.defaultBinCount
    );
    this.props.onBinCountUpdated(binCount);
    this.props.onSelectedColumnUpdated({
      options: {
        dither
      },
      property
    });
  }

  private readonly filterGroupChanged = (
    _ev?: React.FormEvent<HTMLElement | HTMLInputElement> | undefined,
    option?: IChoiceGroupOption | undefined
  ): void => {
    if (typeof option?.key !== "string") {
      return;
    }
    this.props.onSelectedFilterGroupUpdated(option.key);
    let property = option.key;
    if (property === ColumnCategories.None) {
      this.props.onBinCountUpdated(undefined);
      this.props.onSelectedColumnUpdated({
        options: {
          dither: false
        },
        property
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
}
