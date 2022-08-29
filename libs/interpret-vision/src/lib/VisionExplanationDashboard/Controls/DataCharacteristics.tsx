// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FocusZone,
  Stack,
  List,
  DefaultButton,
  Image,
  IRectangle,
  Icon
} from "@fluentui/react";
import { IVisionListItem } from "@responsible-ai/core-ui";
import React from "react";

import { dataCharacteristicsStyles } from "./DataCharacteristics.styles";
import { DataCharacteristicsHeader } from "./DataCharacteristicsHeader";
import { DataCharacteristicsLegend } from "./DataCharacteristicsLegend";

export interface IDataCharacteristicsProps {
  data: IVisionListItem[];
  imageDim: number;
  numRows: number;
  selectItem(item: IVisionListItem): void;
}

export interface IDataCharacteristicsState {
  items: Map<string, IVisionListItem[]>;
  labels: string[];
  labelVisibilities: Map<string, boolean>;
  renderStartIndex: number[];
}

export class DataCharacteristics extends React.Component<
  IDataCharacteristicsProps,
  IDataCharacteristicsState
> {
  columnCount: number;
  rowHeight: number;
  public constructor(props: IDataCharacteristicsProps) {
    super(props);
    this.columnCount = 0;
    this.rowHeight = 0;
    this.state = {
      items: new Map(),
      labels: [],
      labelVisibilities: new Map(),
      renderStartIndex: []
    };
  }

  public componentDidMount(): void {
    const examples: IVisionListItem[] = this.props.data;

    const items = this.state.items;
    const labels: string[] = [];
    const visibilities = this.state.labelVisibilities;

    examples.forEach((example) => {
      const label = example.predictedY;
      if (!label || !items) {
        return;
      }
      if (!labels.includes(label)) {
        labels.push(label);
        visibilities.set(label, true);
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

    const renderStartIndex = this.state.renderStartIndex;

    labels.forEach(() => {
      renderStartIndex.push(0);
    });

    this.setState({
      items,
      labels,
      labelVisibilities: visibilities,
      renderStartIndex
    });
  }

  public render(): React.ReactNode {
    const classNames = dataCharacteristicsStyles();

    const items = this.state.items;

    const keys = [];
    for (const key of items.keys()) {
      keys.push(key);
    }

    return (
      <FocusZone>
        <Stack tokens={{ childrenGap: "l1" }}>
          <Stack.Item>
            <Stack
              horizontal
              tokens={{ childrenGap: "l1" }}
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
                      text="Show all"
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
                  tokens={{ childrenGap: "l1" }}
                  className={classNames.instanceContainer}
                >
                  {this.state.labelVisibilities.get(label.toString()) && (
                    <Stack>
                      <Stack.Item>
                        <DataCharacteristicsHeader
                          label={label}
                          labelListLength={list.length}
                          totalListLength={this.props.data.length}
                        />
                      </Stack.Item>
                      <Stack.Item>
                        <Stack horizontal verticalAlign="center">
                          <Stack.Item
                            style={{
                              height: this.props.imageDim + 10 + 20, //Image + Success/Error label + margin
                              overflow: "hidden",
                              width: "100%"
                            }}
                          >
                            <List
                              items={list}
                              onRenderCell={this.onRenderCell}
                              getPageHeight={this.getPageHeight}
                              getItemCountForPage={this.getItemCountForPage}
                              startIndex={this.state.renderStartIndex[index]}
                            />
                          </Stack.Item>
                          <Stack.Item
                            className={classNames.iconContainer}
                            onClick={this.loadNextItems(index)}
                          >
                            <Icon iconName="DoubleChevronRight12" />
                          </Stack.Item>
                        </Stack>
                      </Stack.Item>
                    </Stack>
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

    if (!item) {
      return <div />;
    }

    return (
      <Stack className={classNames.tile}>
        <Stack.Item
          style={{ height: this.props.imageDim, width: this.props.imageDim }}
        >
          <Image
            alt={item?.predictedY}
            src={`data:image/jpg;base64,${item?.image}`}
            onClick={this.callbackWrapper(item)}
            style={{
              height: "auto",
              left: 0,
              position: "relative",
              top: 0,
              width: this.props.imageDim
            }}
          />
        </Stack.Item>
        <div
          className={
            item.predictedY === item.trueY
              ? classNames.successIndicator
              : classNames.errorIndicator
          }
          style={{ marginBottom: 20, width: this.props.imageDim }}
        />
      </Stack>
    );
  };

  private loadNextItems = (index: number) => () => {
    const renderStartIndex = this.state.renderStartIndex;
    renderStartIndex[index] += this.columnCount;
    this.setState({ renderStartIndex });
  };

  private callbackWrapper = (item: IVisionListItem) => () => {
    this.props.selectItem(item);
  };

  private getPageHeight = () => {
    return this.rowHeight;
  };

  private getItemCountForPage = (
    itemIndex?: number | undefined,
    visibleRect?: IRectangle | undefined
  ): number => {
    if (!visibleRect) {
      return this.columnCount;
    }
    if (itemIndex === 0) {
      this.columnCount = Math.ceil(visibleRect.width / this.props.imageDim) - 1;
      this.rowHeight = Math.floor(visibleRect.width / this.columnCount);
    }
    return this.columnCount;
  };

  private showAll = () => {
    const visibilities = this.state.labelVisibilities;

    for (const label of visibilities.keys()) {
      visibilities.set(label, true);
    }
    this.setState({ labelVisibilities: visibilities });
  };
}
