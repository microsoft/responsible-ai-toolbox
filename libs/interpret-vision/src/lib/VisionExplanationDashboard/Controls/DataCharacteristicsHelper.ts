// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDropdownOption } from "@fluentui/react";
import { DatasetTaskType, IVisionListItem } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

import { ISearchable } from "../Interfaces/ISearchable";
import { getJoinedLabelString } from "../utils/labelUtils";

export interface IDataCharacteristicsProps extends ISearchable {
  items: IVisionListItem[];
  imageDim: number;
  numRows: number;
  selectItem(item: IVisionListItem): void;
  taskType: string;
}

export interface IDataCharacteristicsState {
  columnCount: number[];
  dropdownOptionsPredicted: IDropdownOption[];
  dropdownOptionsTrue: IDropdownOption[];
  itemsPredicted: Map<string, IVisionListItem[]>;
  itemsTrue: Map<string, IVisionListItem[]>;
  labelType: string;
  labelTypeDropdownOptions: IDropdownOption[];
  labelVisibilitiesPredicted: Map<string, boolean>;
  labelVisibilitiesTrue: Map<string, boolean>;
  renderStartIndex: number[];
  selectedKeysPredicted: string[];
  selectedKeysTrue: string[];
  showBackArrow: boolean[];
}

export interface IItemsData {
  dropdownOptions: IDropdownOption[];
  items: Map<string, IVisionListItem[]>;
  labelVisibilities: Map<string, boolean>;
  selectedKeys: string[];
}

export const stackTokens = { childrenGap: "l1" };
export const labelTypes = {
  predictedY: "predictedY",
  trueY: "trueY",
  odCorrect: "Correct",
  odIncorrect: "Incorrect",
};

export const SelectAllKey = "selectAll";
export const defaultState = {
  columnCount: [],
  dropdownOptionsPredicted: [],
  dropdownOptionsTrue: [],
  itemsPredicted: new Map(),
  itemsTrue: new Map(),
  labelVisibilitiesPredicted: new Map(),
  labelVisibilitiesTrue: new Map(),
  renderStartIndex: [],
  selectedKeysPredicted: [],
  selectedKeysTrue: [],
  showBackArrow: []
};

function generateItems(type: string, examples: IVisionListItem[]): IItemsData {
  const dropdownOptions: IDropdownOption[] = [];
  const items: Map<string, IVisionListItem[]> = new Map();
  const labelVisibilities: Map<string, boolean> = new Map();
  const selectedKeys: string[] = [];
  examples.forEach((example) => {
    const baseLabel = example[type]?.toString();
    let label = baseLabel ? baseLabel : "";
    if (type === labelTypes.predictedY) {
      label = getJoinedLabelString(example.predictedY);
    } else if (type === labelTypes.trueY) {
      label = getJoinedLabelString(example.trueY);
    } else if (type === labelTypes.odIncorrect) {
      label = example.odIncorrect;
    } else if (type === labelTypes.odCorrect) {
      label = example.odCorrect;
    }

    if (!items) {
      return;
    }
    if (!selectedKeys.includes(label)) {
      dropdownOptions.push({ key: label, text: label });
      selectedKeys.push(label);
      labelVisibilities.set(label, true);
    }
    if (items.has(label)) {
      const arr = items.get(label);
      if (!arr) {
        return;
      }
      arr.push(example);
      items.set(label, arr);
    } else {
      const arr: IVisionListItem[] = [];
      arr.push(example);
      items.set(label, arr);
    }
  });
  selectedKeys.push(SelectAllKey);
  dropdownOptions.push({
    key: SelectAllKey,
    text: localization.InterpretVision.Dashboard.selectAll
  });
  dropdownOptions.sort((a, b) => {
    if (b.key === SelectAllKey) {
      return 1;
    }
    if (a.key === SelectAllKey || a.key < b.key) {
      return -1;
    }
    return 1;
  });
  return {
    dropdownOptions,
    items,
    labelVisibilities,
    selectedKeys
  };
}

export function getPredOrIncorrectLabelType(taskType: string) : string {
  return (taskType === DatasetTaskType.ObjectDetection)
    ? labelTypes.odIncorrect : labelTypes.predictedY;
}

export function getTrueOrCorrectLabelType(taskType: string) : string {
  return (taskType === DatasetTaskType.ObjectDetection)
    ? labelTypes.odCorrect : labelTypes.trueY;
}

export function processItems(
  items: IVisionListItem[],
  resetLabels: boolean,
  state: IDataCharacteristicsState,
  predOrIncorrectLabelType: string,
  trueOrCorrectLabelType: string,
): Pick<
  IDataCharacteristicsState,
  | "columnCount"
  | "dropdownOptionsPredicted"
  | "dropdownOptionsTrue"
  | "itemsPredicted"
  | "itemsTrue"
  | "labelVisibilitiesPredicted"
  | "labelVisibilitiesTrue"
  | "renderStartIndex"
  | "selectedKeysPredicted"
  | "selectedKeysTrue"
  | "showBackArrow"
> {
  const examples: IVisionListItem[] = items;
  const columnCount: number[] = [];
  const renderStartIndex: number[] = [];
  const showBackArrow: boolean[] = [];

  const predicted: IItemsData = generateItems(predOrIncorrectLabelType, examples);
  const dropdownOptionsPredicted: IDropdownOption[] = predicted.dropdownOptions;
  const itemsPredicted: Map<string, IVisionListItem[]> = predicted.items;

  const trues: IItemsData = generateItems(trueOrCorrectLabelType, examples);
  const dropdownOptionsTrue: IDropdownOption[] = trues.dropdownOptions;
  const itemsTrue: Map<string, IVisionListItem[]> = trues.items;

  let labelVisibilitiesPredicted: Map<string, boolean> =
    predicted.labelVisibilities;
  let selectedKeysPredicted: string[] = predicted.selectedKeys;
  let labelVisibilitiesTrue: Map<string, boolean> = trues.labelVisibilities;
  let selectedKeysTrue: string[] = trues.selectedKeys;
  if (!resetLabels) {
    labelVisibilitiesPredicted = state.labelVisibilitiesPredicted;
    selectedKeysPredicted = state.selectedKeysPredicted;
    labelVisibilitiesTrue = state.labelVisibilitiesTrue;
    selectedKeysTrue = state.selectedKeysTrue;
  }

  selectedKeysPredicted.forEach(() => {
    renderStartIndex.push(0);
    showBackArrow.push(false);
    columnCount.push(0);
  });
  return {
    columnCount,
    dropdownOptionsPredicted,
    dropdownOptionsTrue,
    itemsPredicted,
    itemsTrue,
    labelVisibilitiesPredicted,
    labelVisibilitiesTrue,
    renderStartIndex,
    selectedKeysPredicted,
    selectedKeysTrue,
    showBackArrow
  };
}

export function getLabelVisibility(
  item: IDropdownOption<any>,
  state: IDataCharacteristicsState,
  predOrIncorrectLabelType: string
): Pick<
  IDataCharacteristicsState,
  | "labelVisibilitiesPredicted"
  | "selectedKeysPredicted"
  | "labelVisibilitiesTrue"
  | "selectedKeysTrue"
> {
  const predicted = state.labelType === predOrIncorrectLabelType;

  if (item.key === SelectAllKey) {
    const dropdownOptions = predicted
      ? state.dropdownOptionsPredicted
      : state.dropdownOptionsTrue;
    const selectedKeys: string[] = [];
    const labelVisibilities: Map<string, boolean> = new Map();
    if (
      (predicted &&
        state.selectedKeysPredicted.length >= dropdownOptions.length - 1) ||
      (!predicted &&
        state.selectedKeysTrue.length >= dropdownOptions.length - 1)
    ) {
      dropdownOptions.forEach((option, index) => {
        if (index !== 0) {
          labelVisibilities.set(option.key.toString(), false);
        }
      });
    } else {
      dropdownOptions.forEach((option, index) => {
        if (index !== 0) {
          selectedKeys.push(option.key.toString());
          labelVisibilities.set(option.key.toString(), true);
        }
      });
      selectedKeys.push(SelectAllKey);
    }
    if (predicted) {
      return {
        labelVisibilitiesPredicted: labelVisibilities,
        labelVisibilitiesTrue: state.labelVisibilitiesTrue,
        selectedKeysPredicted: [...selectedKeys],
        selectedKeysTrue: state.selectedKeysTrue
      };
    }
    return {
      labelVisibilitiesPredicted: state.labelVisibilitiesPredicted,
      labelVisibilitiesTrue: labelVisibilities,
      selectedKeysPredicted: state.selectedKeysPredicted,
      selectedKeysTrue: [...selectedKeys]
    };
  }

  let selectedKeys: string[] = [];
  let labelVisibilities: Map<string, boolean> = new Map();

  if (predicted) {
    selectedKeys = state.selectedKeysPredicted;
    labelVisibilities = state.labelVisibilitiesPredicted;
  } else {
    selectedKeys = state.selectedKeysTrue;
    labelVisibilities = state.labelVisibilitiesTrue;
  }

  if (selectedKeys.includes(SelectAllKey)) {
    selectedKeys.splice(selectedKeys.indexOf(SelectAllKey), 1);
  }
  const key = item.key.toString();
  selectedKeys.includes(key)
    ? selectedKeys.splice(selectedKeys.indexOf(key), 1)
    : selectedKeys.push(key);
  labelVisibilities.set(key, !labelVisibilities.get(key));
  if (predicted) {
    return {
      labelVisibilitiesPredicted: labelVisibilities,
      labelVisibilitiesTrue: state.labelVisibilitiesTrue,
      selectedKeysPredicted: [...selectedKeys],
      selectedKeysTrue: state.selectedKeysTrue
    };
  }
  return {
    labelVisibilitiesPredicted: state.labelVisibilitiesPredicted,
    labelVisibilitiesTrue: labelVisibilities,
    selectedKeysPredicted: state.selectedKeysPredicted,
    selectedKeysTrue: [...selectedKeys]
  };
}
