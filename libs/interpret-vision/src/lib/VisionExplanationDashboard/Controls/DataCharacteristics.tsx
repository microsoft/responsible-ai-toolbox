// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FocusZone,
  Stack,
  Image,
  IRectangle,
  mergeStyles,
  Dropdown,
  IDropdownOption
} from "@fluentui/react";
import { IVisionListItem } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { dataCharacteristicsStyles } from "./DataCharacteristics.styles";
import { DataCharacteristicsLegend } from "./DataCharacteristicsLegend";
import { DataCharacteristicsRow } from "./DataCharacteristicsRow";

export interface IDataCharacteristicsProps {
  data: IVisionListItem[];
  imageDim: number;
  numRows: number;
  selectItem(item: IVisionListItem): void;
}
export interface IDataCharacteristicsState {
  columnCount: number[];
  dropdownOptionsP: IDropdownOption[];
  dropdownOptionsT: IDropdownOption[];
  itemsP: Map<string, IVisionListItem[]>;
  itemsT: Map<string, IVisionListItem[]>;
  labelType: string;
  labelTypeDropdownOptions: IDropdownOption[];
  labelVisibilitiesP: Map<string, boolean>;
  labelVisibilitiesT: Map<string, boolean>;
  renderStartIndex: number[];
  selectedKeysP: string[];
  selectedKeysT: string[];
  showBackArrow: boolean[];
}
const stackTokens = { childrenGap: "l1" };
const labelTypes = {
  predictedY: "predictedY",
  trueY: "trueY"
};

const SelectAllKey = "selectAll";
export class DataCharacteristics extends React.Component<
  IDataCharacteristicsProps,
  IDataCharacteristicsState
> {
  rowHeight: number;
  public constructor(props: IDataCharacteristicsProps) {
    super(props);
    this.rowHeight = 0;
    this.state = {
      columnCount: [],
      dropdownOptionsP: [],
      dropdownOptionsT: [],
      itemsP: new Map(),
      itemsT: new Map(),
      labelType: labelTypes.predictedY,
      labelTypeDropdownOptions: [],
      labelVisibilitiesP: new Map(),
      labelVisibilitiesT: new Map(),
      renderStartIndex: [],
      selectedKeysP: [],
      selectedKeysT: [],
      showBackArrow: []
    };
  }

  public componentDidMount(): void {
    const labelTypeDropdownOptions: IDropdownOption[] = [
      { key: labelTypes.predictedY, text: labelTypes.predictedY },
      { key: labelTypes.trueY, text: labelTypes.trueY }
    ];
    this.setState({ labelTypeDropdownOptions });
    this.processData();
  }

  public componentDidUpdate(prevProps: IDataCharacteristicsProps): void {
    if (prevProps.data !== this.props.data) {
      this.processData();
    }
  }

  public render(): React.ReactNode {
    const classNames = dataCharacteristicsStyles();
    const predicted = this.state.labelType === labelTypes.predictedY;
    const items = predicted ? this.state.itemsP : this.state.itemsT;
    let keys = [];
    for (const key of items.keys()) {
      keys.push(key);
    }
    keys = this.sortKeys(keys);
    return (
      <FocusZone>
        <Stack tokens={stackTokens}>
          <Stack.Item>
            <Stack
              horizontal
              tokens={stackTokens}
              horizontalAlign="space-between"
              verticalAlign="center"
            >
              <Stack.Item className={classNames.labelsContainer}>
                <Stack horizontal tokens={{ childrenGap: "s1" }}>
                  <Stack.Item>
                    <Dropdown
                      id="labelTypeDropdown"
                      label={
                        localization.InterpretVision.Dashboard.labelTypeDropdown
                      }
                      options={this.state.labelTypeDropdownOptions}
                      selectedKey={this.state.labelType}
                      onChange={this.onLabelTypeChange}
                    />
                  </Stack.Item>
                  <Stack.Item>
                    <Dropdown
                      id="labelVisibilitySelectorsDropdown"
                      className={classNames.dropdown}
                      label={
                        localization.InterpretVision.Dashboard
                          .labelVisibilityDropdown
                      }
                      options={
                        this.state.labelType === labelTypes.predictedY
                          ? this.state.dropdownOptionsP
                          : this.state.dropdownOptionsT
                      }
                      selectedKeys={
                        this.state.labelType === labelTypes.predictedY
                          ? this.state.selectedKeysP
                          : this.state.selectedKeysT
                      }
                      onChange={this.onLabelVisibilitySelect}
                      multiSelect
                    />
                  </Stack.Item>
                </Stack>
              </Stack.Item>
              <Stack.Item>
                <DataCharacteristicsLegend />
              </Stack.Item>
            </Stack>
          </Stack.Item>
          <Stack.Item
            className={classNames.mainContainer}
            style={{ height: this.props.numRows * this.props.imageDim * 1.8 }}
          >
            {keys.map((label, index) => {
              const list = items.get(label);
              const labelVisibilities = predicted
                ? this.state.labelVisibilitiesP
                : this.state.labelVisibilitiesT;
              if (!list) {
                return <div />;
              }
              return (
                <Stack
                  key={label}
                  tokens={stackTokens}
                  className={classNames.instanceContainer}
                >
                  {labelVisibilities.get(label.toString()) && (
                    <Stack.Item>
                      <DataCharacteristicsRow
                        columnCount={this.state.columnCount[index]}
                        index={index}
                        imageDim={this.props.imageDim}
                        label={label}
                        labelType={this.state.labelType}
                        list={list}
                        processData={this.processData}
                        renderStartIndex={this.state.renderStartIndex}
                        showBackArrow={this.state.showBackArrow}
                        totalListLength={this.props.data.length}
                        onRenderCell={this.onRenderCell}
                        loadPrevItems={this.loadPrevItems}
                        loadNextItems={this.loadNextItems}
                        getPageHeight={this.getPageHeight}
                        getItemCountForPage={this.getItemCountForPageWrapper(
                          index
                        )}
                      />
                    </Stack.Item>
                  )}
                </Stack>
              );
            })}
          </Stack.Item>
        </Stack>
      </FocusZone>
    );
  }

  private onRenderCell = (item?: IVisionListItem | undefined) => {
    const classNames = dataCharacteristicsStyles();
    const indicatorStyle = mergeStyles(
      classNames.indicator,
      { width: this.props.imageDim },
      item?.predictedY === item?.trueY
        ? classNames.successIndicator
        : classNames.errorIndicator
    );
    return !item ? (
      <div />
    ) : (
      <Stack className={classNames.tile}>
        <Stack.Item
          style={{ height: this.props.imageDim, width: this.props.imageDim }}
        >
          <Image
            alt={item?.predictedY}
            src={`data:image/jpg;base64,${item?.image}`}
            onClick={this.callbackWrapper(item)}
            className={classNames.image}
            style={{ width: this.props.imageDim }}
          />
        </Stack.Item>
        <div className={indicatorStyle} />
      </Stack>
    );
  };

  private processData = (): void => {
    const examples: IVisionListItem[] = this.props.data;
    const columnCount: number[] = [];
    const itemsP: Map<string, IVisionListItem[]> = new Map();
    const itemsT: Map<string, IVisionListItem[]> = new Map();
    const labelVisibilitiesP: Map<string, boolean> = new Map();
    const labelVisibilitiesT: Map<string, boolean> = new Map();
    const renderStartIndex: number[] = [];
    const showBackArrow: boolean[] = [];
    const dropdownOptionsP: IDropdownOption[] = [];
    const dropdownOptionsT: IDropdownOption[] = [];
    const selectedKeysP: string[] = [];
    const selectedKeysT: string[] = [];
    dropdownOptionsP.push({
      key: SelectAllKey,
      text: localization.InterpretVision.Dashboard.selectAll
    });
    dropdownOptionsT.push({
      key: SelectAllKey,
      text: localization.InterpretVision.Dashboard.selectAll
    });
    examples.forEach((example) => {
      const labelP = example[labelTypes.predictedY].toString();
      const labelT = example[labelTypes.trueY].toString();
      if (!labelP || !labelT || !itemsP || !itemsT) {
        return;
      }
      if (!selectedKeysP.includes(labelP)) {
        dropdownOptionsP.push({ key: labelP, text: labelP });
        selectedKeysP.push(labelP);
        labelVisibilitiesP.set(labelP, true);
      }
      if (!selectedKeysT.includes(labelT)) {
        dropdownOptionsT.push({ key: labelT, text: labelT });
        selectedKeysT.push(labelT);
        labelVisibilitiesT.set(labelT, true);
      }
      if (itemsP.has(labelP)) {
        const arr = itemsP.get(labelP);
        if (!arr) {
          return;
        }
        arr.push(example);
        itemsP.set(labelP, arr);
      } else {
        const arr: IVisionListItem[] = [];
        arr.push(example);
        itemsP.set(labelP, arr);
      }
      if (itemsT.has(labelT)) {
        const arr = itemsT.get(labelT);
        if (!arr) {
          return;
        }
        arr.push(example);
        itemsT.set(labelT, arr);
      } else {
        const arr: IVisionListItem[] = [];
        arr.push(example);
        itemsT.set(labelT, arr);
      }
    });
    selectedKeysP.forEach(() => {
      renderStartIndex.push(0);
      showBackArrow.push(false);
      columnCount.push(0);
    });
    dropdownOptionsP.sort((a, b) => {
      if (b.key === SelectAllKey) {
        return 1;
      }
      if (a.key === SelectAllKey || a.key < b.key) {
        return -1;
      }
      return 1;
    });
    dropdownOptionsT.sort((a, b) => {
      if (b.key === SelectAllKey) {
        return 1;
      }
      if (a.key === SelectAllKey || a.key < b.key) {
        return -1;
      }
      return 1;
    });
    selectedKeysP.push(SelectAllKey);
    selectedKeysT.push(SelectAllKey);
    this.setState({
      columnCount,
      dropdownOptionsP,
      dropdownOptionsT,
      itemsP,
      itemsT,
      labelVisibilitiesP,
      labelVisibilitiesT,
      renderStartIndex,
      selectedKeysP,
      selectedKeysT,
      showBackArrow
    });
  };

  private onLabelTypeChange = (
    _event: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption<any> | undefined
  ): void => {
    if (item) {
      this.setState({ labelType: item.key.toString() });
    }
  };

  private onLabelVisibilitySelect = (
    _event: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption<any> | undefined
  ): void => {
    if (item) {
      const predicted = this.state.labelType === labelTypes.predictedY;

      if (item.key === SelectAllKey) {
        const dropdownOptions = predicted
          ? this.state.dropdownOptionsP
          : this.state.dropdownOptionsT;
        const selectedKeys: string[] = [];
        const labelVisibilities: Map<string, boolean> = new Map();
        if (
          (predicted &&
            this.state.selectedKeysP.length >= dropdownOptions.length - 1) ||
          (!predicted &&
            this.state.selectedKeysT.length >= dropdownOptions.length - 1)
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
          this.setState({
            labelVisibilitiesP: labelVisibilities,
            selectedKeysP: [...selectedKeys]
          });
        } else {
          this.setState({
            labelVisibilitiesT: labelVisibilities,
            selectedKeysT: [...selectedKeys]
          });
        }
        return;
      }

      let selectedKeys: string[] = [];
      let labelVisibilities: Map<string, boolean> = new Map();

      if (predicted) {
        selectedKeys = this.state.selectedKeysP;
        labelVisibilities = this.state.labelVisibilitiesP;
      } else {
        selectedKeys = this.state.selectedKeysT;
        labelVisibilities = this.state.labelVisibilitiesT;
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
        this.setState({
          labelVisibilitiesP: labelVisibilities,
          selectedKeysP: [...selectedKeys]
        });
      } else {
        this.setState({
          labelVisibilitiesT: labelVisibilities,
          selectedKeysT: [...selectedKeys]
        });
      }
    }
  };

  private sortKeys(keys: string[]): string[] {
    const items =
      this.state.labelType === labelTypes.predictedY
        ? this.state.itemsP
        : this.state.itemsT;
    keys.sort(function (a, b) {
      const aItems = items.get(a);
      const bItems = items.get(b);
      const aCount = aItems?.filter(
        (item) => item.predictedY !== item.trueY
      ).length;
      const bCount = bItems?.filter(
        (item) => item.predictedY !== item.trueY
      ).length;
      if (aCount === bCount) {
        return a > b ? 1 : -1;
      }
      return !aCount || !bCount ? 0 : bCount - aCount;
    });
    return keys;
  }

  private loadNextItems = (index: number) => () => {
    const { renderStartIndex, showBackArrow } = this.state;
    let columnCount = this.state.columnCount[index];
    columnCount -= columnCount % 2 !== 0 ? 1 : 0;
    renderStartIndex[index] += columnCount;
    showBackArrow[index] = true;
    this.setState({ renderStartIndex, showBackArrow });
  };

  private loadPrevItems = (index: number) => () => {
    const { renderStartIndex, showBackArrow } = this.state;
    renderStartIndex[index] -= this.state.columnCount[index];
    if (renderStartIndex[index] <= 0) {
      renderStartIndex[index] = 0;
      showBackArrow[index] = false;
    }
    this.setState({ renderStartIndex, showBackArrow });
  };

  private callbackWrapper = (item: IVisionListItem) => () => {
    this.props.selectItem(item);
  };

  private getPageHeight = () => {
    return this.rowHeight;
  };

  private getItemCountForPageWrapper(index: number) {
    const getItemCountForPage = (
      itemIndex?: number | undefined,
      visibleRect?: IRectangle | undefined
    ): number => {
      const columnCount = this.state.columnCount;
      if (!visibleRect) {
        return columnCount[index];
      }
      if (itemIndex === 0) {
        columnCount[index] =
          Math.floor(visibleRect.width / this.props.imageDim) - 1;
        this.setState({ columnCount: [...columnCount] });
        this.rowHeight = Math.floor(visibleRect.width / columnCount[index]);
      }
      return columnCount[index];
    };
    return getItemCountForPage;
  }
}
