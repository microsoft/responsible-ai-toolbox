// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FocusZone,
  Stack,
  Image,
  IRectangle,
  mergeStyles,
  Dropdown,
  IDropdownOption,
  ImageFit
} from "@fluentui/react";
import { IVisionListItem } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { getAltTextForItem } from "../utils/getAltTextUtils";
import { getFilteredDataFromSearch } from "../utils/getFilteredData";
import { getJoinedLabelString } from "../utils/labelUtils";

import { dataCharacteristicsStyles } from "./DataCharacteristics.styles";
import {
  defaultState,
  getLabelVisibility,
  getPredOrIncorrectLabelType,
  getTrueOrCorrectLabelType,
  IDataCharacteristicsProps,
  IDataCharacteristicsState,
  processItems,
  stackTokens
} from "./DataCharacteristicsHelper";
import { DataCharacteristicsLegend } from "./DataCharacteristicsLegend";
import { DataCharacteristicsRow } from "./DataCharacteristicsRow";
import { sortKeys } from "./DataCharacteristicsSortHelper";

export class DataCharacteristics extends React.Component<
  IDataCharacteristicsProps,
  IDataCharacteristicsState
> {
  private rowHeight = 0;
  private predOrIncorrectLabelType: string = getPredOrIncorrectLabelType(
    this.props.taskType
  );
  private trueOrCorrectLabelType: string = getTrueOrCorrectLabelType(
    this.props.taskType
  );
  private classNames = dataCharacteristicsStyles();
  public constructor(props: IDataCharacteristicsProps) {
    super(props);
    const labelType = this.predOrIncorrectLabelType;
    const labelTypeDropdownOptions: IDropdownOption[] = [
      { key: labelType, text: labelType },
      { key: this.trueOrCorrectLabelType, text: this.trueOrCorrectLabelType }
    ];
    this.state = {
      ...defaultState,
      labelType,
      labelTypeDropdownOptions
    };
  }

  public componentDidMount = (): void => this.processData(true);

  public componentDidUpdate(prevProps: IDataCharacteristicsProps): void {
    if (this.props.items !== prevProps.items) {
      this.processData(true);
    } else if (this.props.searchValue !== prevProps.searchValue) {
      this.processData(false);
    }
  }

  public render(): React.ReactNode {
    const predicted = this.state.labelType === this.predOrIncorrectLabelType;
    const items = predicted ? this.state.itemsPredicted : this.state.itemsTrue;
    const keys = sortKeys([...items.keys()], items, this.props.taskType);
    const dropdownOptions = predicted
      ? this.state.dropdownOptionsPredicted
      : this.state.dropdownOptionsTrue;
    const dropdownKeys = predicted
      ? this.state.selectedKeysPredicted
      : this.state.selectedKeysTrue;
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
              <Stack.Item className={this.classNames.labelsContainer}>
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
                      ariaLabel={
                        localization.InterpretVision.Dashboard
                          .labelTypeAriaLabel
                      }
                    />
                  </Stack.Item>
                  <Stack.Item>
                    <Dropdown
                      id="labelVisibilitySelectorsDropdown"
                      className={this.classNames.dropdown}
                      label={
                        localization.InterpretVision.Dashboard
                          .labelVisibilityDropdown
                      }
                      options={dropdownOptions}
                      selectedKeys={dropdownKeys}
                      onChange={this.onLabelVisibilitySelect}
                      multiSelect
                      ariaLabel={
                        localization.InterpretVision.Dashboard
                          .labelVisibilityAriaLabel
                      }
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
            className={this.classNames.mainContainer}
            id="classViewContainer"
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
                  className={this.classNames.instanceContainer}
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
                        renderStartIndex={this.state.renderStartIndex}
                        showBackArrow={this.state.showBackArrow}
                        totalListLength={this.props.items.length}
                        onRenderCell={this.onRenderCell}
                        loadPrevItems={this.loadPrevItems}
                        loadNextItems={this.loadNextItems}
                        getPageHeight={(): number => this.rowHeight}
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

  private processData = (resetLabels: boolean): void => {
    const filteredItems = getFilteredDataFromSearch(
      this.props.searchValue,
      this.props.items,
      this.props.taskType,
      this.props.onSearchUpdated
    );
    this.setState(
      processItems(
        filteredItems,
        resetLabels,
        this.state,
        this.predOrIncorrectLabelType,
        this.trueOrCorrectLabelType
      )
    );
  };

  private onRenderCell = (
    item?: IVisionListItem | undefined
  ): React.ReactElement => {
    if (!item) {
      return <div />;
    }
    const imageDim = this.props.imageDim;
    const predictedY = getJoinedLabelString(item.predictedY);
    const trueY = getJoinedLabelString(item.trueY);
    const indicator =
      predictedY === trueY
        ? this.classNames.successIndicator
        : this.classNames.errorIndicator;
    const indicatorStyle = mergeStyles(
      this.classNames.indicator,
      { width: imageDim },
      indicator
    );
    return (
      <Stack className={this.classNames.tile}>
        <Stack.Item style={{ height: imageDim, width: imageDim }}>
          <Image
            alt={getAltTextForItem(item, this.props.taskType)}
            src={`data:image/jpg;base64,${item.image}`}
            onClick={this.callbackWrapper(item)}
            className={this.classNames.image}
            style={{ display: "inline", height: imageDim }}
            imageFit={ImageFit.none}
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
    if (item) {
      this.setState(
        getLabelVisibility(item, this.state, this.predOrIncorrectLabelType)
      );
    }
  };

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

  private callbackWrapper = (item: IVisionListItem) => (): void =>
    this.props.selectItem(item);

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
      if (visibleRect && itemIndex === 0) {
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
