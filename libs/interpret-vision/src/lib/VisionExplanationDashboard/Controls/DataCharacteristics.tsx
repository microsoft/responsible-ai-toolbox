// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FocusZone,
  Stack,
  DefaultButton,
  Image,
  IRectangle,
  mergeStyles
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
  items: Map<string, IVisionListItem[]>;
  labels: string[];
  labelVisibilities: Map<string, boolean>;
  renderStartIndex: number[];
  showBackArrow: boolean[];
}
const stackTokens = { childrenGap: "l1" };
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
      items: new Map(),
      labels: [],
      labelVisibilities: new Map(),
      renderStartIndex: [],
      showBackArrow: []
    };
  }

  public componentDidMount(): void {
    this.processData();
  }

  public componentDidUpdate(prevProps: IDataCharacteristicsProps): void {
    if (prevProps.data !== this.props.data) {
      this.processData();
    }
  }

  public render(): React.ReactNode {
    const classNames = dataCharacteristicsStyles();
    const items = this.state.items;
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
                    <Stack horizontal>
                      {this.state.labels.map((label) => (
                        <Stack.Item key={label}>
                          {this.state.labelVisibilities.get(label) && (
                            <DefaultButton
                              text={label}
                              iconProps={{ iconName: "Cancel" }}
                              onClick={() => {
                                const visibilities =
                                  this.state.labelVisibilities;
                                visibilities.set(label, false);
                                this.setState({
                                  labelVisibilities: visibilities
                                });
                              }}
                            />
                          )}
                        </Stack.Item>
                      ))}
                    </Stack>
                  </Stack.Item>
                  <Stack.Item>
                    <DefaultButton
                      primary
                      text={localization.InterpretVision.Dashboard.showAll}
                      onClick={this.showAll}
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
              if (!list) {
                return <div />;
              }
              return (
                <Stack
                  key={label}
                  tokens={stackTokens}
                  className={classNames.instanceContainer}
                >
                  {this.state.labelVisibilities.get(label.toString()) && (
                    <Stack.Item>
                      <DataCharacteristicsRow
                        columnCount={this.state.columnCount[index]}
                        index={index}
                        imageDim={this.props.imageDim}
                        label={label}
                        list={list}
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
    const items: Map<string, IVisionListItem[]> = new Map();
    const labels: string[] = [];
    const labelVisibilities: Map<string, boolean> = new Map();
    const renderStartIndex: number[] = [];
    const showBackArrow: boolean[] = [];

    examples.forEach((example) => {
      const label = example.predictedY;
      if (!label || !items) {
        return;
      }
      if (!labels.includes(label)) {
        labels.push(label);
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
    labels.forEach(() => {
      renderStartIndex.push(0);
      showBackArrow.push(false);
      columnCount.push(0);
    });
    this.setState({
      columnCount,
      items,
      labels,
      labelVisibilities,
      renderStartIndex,
      showBackArrow
    });
  };

  private sortKeys(keys: string[]): string[] {
    const { items } = this.state;
    keys.sort(function (a, b) {
      const aItems = items.get(a);
      const bItems = items.get(b);
      const aCount = aItems?.filter(
        (item) => item.predictedY !== item.trueY
      ).length;
      const bCount = bItems?.filter(
        (item) => item.predictedY !== item.trueY
      ).length;
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

  private showAll = () => {
    const visibilities = this.state.labelVisibilities;
    for (const label of visibilities.keys()) {
      visibilities.set(label, true);
    }
    this.setState({ labelVisibilities: visibilities });
  };
}
