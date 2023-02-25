// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IComboBoxOption } from "@fluentui/react";
import _ from "lodash";

import { ISelectorConfig } from "../util/IGenericChartProps";
import { JointDataset } from "../util/JointDataset";

import { IAxisConfigDialogProps } from "./AxisConfigDialogProps";
import {
  constructClassArray,
  constructDataArray,
  constructMultilabelArray,
  extractSelectionKey,
  getBinCountForProperty
} from "./AxisConfigDialogUtils";

export interface IAxisConfigDialogState {
  selectedColumn: ISelectorConfig;
  binCount?: number;
  selectedFilterGroup?: string;
  dataArray: IComboBoxOption[];
  classArray: IComboBoxOption[];
  multilabelPredictedYArray: IComboBoxOption[];
  multilabelTrueYArray: IComboBoxOption[];
}

export function buildAxisConfigDialogState(
  jointDataset: JointDataset,
  props: IAxisConfigDialogProps,
  defaultBinCount: number,
  droppedFeatureSet: Set<string>
): IAxisConfigDialogState {
  return {
    binCount: getBinCountForProperty(
      jointDataset.metaDict[props.selectedColumn.property],
      props.canBin,
      defaultBinCount
    ),
    classArray: constructClassArray(jointDataset),
    dataArray: constructDataArray(
      jointDataset,
      props.hideDroppedFeatures,
      droppedFeatureSet
    ),
    multilabelPredictedYArray: constructMultilabelArray(
      jointDataset,
      JointDataset.PredictedYLabel
    ),
    multilabelTrueYArray: constructMultilabelArray(
      jointDataset,
      JointDataset.TrueYLabel
    ),
    selectedColumn: _.cloneDeep(props.selectedColumn),
    selectedFilterGroup: extractSelectionKey(props.selectedColumn.property)
  };
}
