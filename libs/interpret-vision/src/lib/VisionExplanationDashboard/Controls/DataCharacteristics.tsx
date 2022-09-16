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
import {
  defaultState,
  getLabelVisibility,
  IDataCharacteristicsProps,
  IDataCharacteristicsState,
  labelTypes,
  processData,
  stackTokens
} from "./DataCharacteristicsHelper";
import { DataCharacteristicsLegend } from "./DataCharacteristicsLegend";
import { DataCharacteristicsRow } from "./DataCharacteristicsRow";

export class DataCharacteristics extends React.Component<
  IDataCharacteristicsProps,
  IDataCharacteristicsState
> {
  private rowHeight: number;
  public constructor(props: IDataCharacteristicsProps) {
    super(props);
    this.rowHeight = 0;
    this.state = defaultState;
  }

  public componentDidMount(): void {
    const labelTypeDropdownOptions: IDropdownOption[] = [
      { key: labelTypes.predictedY, text: labelTypes.predictedY },
      { key: labelTypes.trueY, text: labelTypes.trueY }
    ];
    this.setState({
      labelTypeDropdownOptions
    });
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
    const items = predicted ? this.state.itemsPredicted : this.state.itemsTrue;
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
                          ? this.state.dropdownOptionsPredicted
                          : this.state.dropdownOptionsTrue
                      }
                      selectedKeys={
                        this.state.labelType === labelTypes.predictedY
                          ? this.state.selectedKeysPredicted
                          : this.state.selectedKeysTrue
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
                ? this.state.labelVisibilitiesPredicted
                : this.state.labelVisibilitiesTrue;
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

  private processData = (): void => {
    this.setState(processData(this.props.data));
  };

  private onRenderCell = (
    item?: IVisionListItem | undefined
  ): React.ReactElement => {
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
    if (!item) {
      return;
    }
    this.setState(getLabelVisibility(item, this.state));
  };

  private sortKeys(keys: string[]): string[] {
    const items =
      this.state.labelType === labelTypes.predictedY
        ? this.state.itemsPredicted
        : this.state.itemsTrue;
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

  private loadNextItems = (index: number) => (): void => {
    const { renderStartIndex, showBackArrow } = this.state;
    let columnCount = this.state.columnCount[index];
    columnCount -= columnCount % 2 !== 0 ? 1 : 0;
    renderStartIndex[index] += columnCount;
    showBackArrow[index] = true;
    this.setState({ renderStartIndex, showBackArrow });
  };

  private loadPrevItems = (index: number) => (): void => {
    const { renderStartIndex, showBackArrow } = this.state;
    renderStartIndex[index] -= this.state.columnCount[index];
    if (renderStartIndex[index] <= 0) {
      renderStartIndex[index] = 0;
      showBackArrow[index] = false;
    }
    this.setState({ renderStartIndex, showBackArrow });
  };

  private callbackWrapper = (item: IVisionListItem) => (): void => {
    this.props.selectItem(item);
  };

  private getPageHeight = (): number => {
    return this.rowHeight;
  };

  private getItemCountForPageWrapper = (
    index: number
  ): ((
    itemIndex?: number | undefined,
    visibleRect?: IRectangle | undefined
  ) => number) => {
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
  };
}
