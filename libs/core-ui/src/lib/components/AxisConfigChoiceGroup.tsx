// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ChoiceGroup, IChoiceGroupOption } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { cohortKey } from "../cohortKey";
import { ISelectorConfig } from "../util/IGenericChartProps";
import { JointDataset } from "../util/JointDataset";
import { ColumnCategories } from "../util/JointDatasetUtils";

import {
  getBinCountForProperty,
  metaDescription
} from "./AxisConfigDialogUtils";

export interface IAxisConfigChoiceGroupProps {
  canBin: boolean;
  canDither: boolean;
  defaultBinCount: number;
  jointDataset: JointDataset;
  mustBin: boolean;
  orderedGroupTitles: ColumnCategories[];
  selectedFilterGroup?: string;
  removeCount?: boolean;
  onBinCountUpdated: (binCount?: number) => void;
  onSelectedColumnUpdated: (selectedColumn: ISelectorConfig) => void;
  onSelectedFilterGroupUpdated: (selectedFilterGroup?: string) => void;
}

function getLeftItems(removeCount?: boolean): string[] {
  const leftItems = [
    cohortKey,
    JointDataset.IndexLabel,
    JointDataset.DataLabelRoot,
    JointDataset.PredictedYLabel,
    JointDataset.TrueYLabel,
    JointDataset.ClassificationError,
    JointDataset.RegressionError,
    JointDataset.ProbabilityYRoot,
    ColumnCategories.None
  ];
  if (removeCount) {
    leftItems.pop();
  }
  return leftItems;
}

export class AxisConfigChoiceGroup extends React.PureComponent<IAxisConfigChoiceGroupProps> {
  private readonly leftItems = getLeftItems(this.props.removeCount).reduce(
    (
      previousValue: Array<{
        key: string;
        title: string;
        ariaLabel?: string;
      }>,
      key
    ) => {
      const metaVal = this.props.jointDataset.metaDict[key];
      let ariaLabel = metaVal?.abbridgedLabel;
      if (key === ColumnCategories.None) {
        ariaLabel += localization.Interpret.AxisConfigDialog.countHelperText;
      } else {
        const metaDesc = metaDescription(metaVal);
        ariaLabel += metaVal?.treatAsCategorical
          ? metaDesc.categoricalDescription
          : metaDesc.minDescription + metaDesc.maxDescription;
      }

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
        key === JointDataset.PredictedYLabel &&
        this.props.jointDataset.numLabels > 1
      ) {
        previousValue.push({
          key,
          title: localization.Interpret.Columns.predictedLabels
        });
        return previousValue;
      }
      if (
        key === JointDataset.TrueYLabel &&
        this.props.jointDataset.numLabels > 1
      ) {
        previousValue.push({
          key,
          title: localization.Interpret.Columns.trueLabels
        });
        return previousValue;
      }
      if (
        metaVal === undefined ||
        !this.props.orderedGroupTitles.includes(metaVal.category)
      ) {
        return previousValue;
      }

      previousValue.push({ ariaLabel, key, title: metaVal.abbridgedLabel });
      return previousValue;
    },
    []
  );

  public render(): React.ReactNode {
    return (
      <ChoiceGroup
        label={localization.Interpret.AxisConfigDialog.selectFilter}
        options={this.leftItems.map((i) => ({
          ariaLabel: i.ariaLabel,
          key: i.key,
          text: i.title
        }))}
        onChange={this.filterGroupChanged}
        selectedKey={this.props.selectedFilterGroup}
      />
    );
  }

  private setDefaultStateForKey = (property: string): void => {
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
      property,
      type: this.props.jointDataset.metaDict[property]?.AxisType
    });
  };

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
        property,
        type: this.props.jointDataset.metaDict[property]?.AxisType
      });
      return;
    }
    if (
      property === JointDataset.DataLabelRoot ||
      property === JointDataset.ProbabilityYRoot ||
      (this.props.jointDataset.numLabels > 1 &&
        (property === JointDataset.TrueYLabel ||
          property === JointDataset.PredictedYLabel))
    ) {
      property += "0";
    }
    this.setDefaultStateForKey(property);
  };
}
