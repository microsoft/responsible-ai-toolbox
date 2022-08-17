// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Text,
  FocusZone,
  Stack,
  List,
  DefaultButton,
  Image,
  ImageFit,
  IPageSpecification,
  IRectangle,
  Icon
} from "@fluentui/react";
import { IVisionListItem } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { dataCharacteristicsStyles } from "./DataCharacteristics.styles";

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
}

export class DataCharacteristics extends React.Component<
  IDataCharacteristicsProps,
  IDataCharacteristicsState
> {
  public constructor(props: IDataCharacteristicsProps) {
    super(props);

    this.state = {
      items: new Map(),
      labels: [],
      labelVisibilities: new Map()
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

    this.setState({ items, labels, labelVisibilities: visibilities });
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
              <Stack.Item>
                <Stack horizontal tokens={{ childrenGap: "s1" }}>
                  <Stack.Item>
                    <Stack horizontal>
                      {this.state.labels.map((label) => (
                        <Stack.Item key={label}>
                          {this.state.labelVisibilities.get(label) && (
                            <DefaultButton
                              text={`label ${label}`}
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
                <Stack
                  horizontal
                  tokens={{ childrenGap: "l1" }}
                  verticalAlign="center"
                >
                  <Stack.Item>
                    <div
                      className={classNames.successIndicator}
                      style={{ height: 10, width: 75 }}
                    />
                  </Stack.Item>
                  <Stack.Item>
                    <Text variant="small">
                      {localization.InterpretVision.Dashboard.titleBarSuccess}
                    </Text>
                  </Stack.Item>
                  <Stack.Item>
                    <div
                      className={classNames.errorIndicator}
                      style={{ height: 10, width: 75 }}
                    />
                  </Stack.Item>
                  <Stack.Item>
                    <Text variant="small">
                      {localization.InterpretVision.Dashboard.titleBarError}
                    </Text>
                  </Stack.Item>
                </Stack>
              </Stack.Item>
            </Stack>
          </Stack.Item>
          <Stack.Item
            className={classNames.mainContainer}
            style={{ height: this.props.numRows * this.props.imageDim * 1.8 }}
          >
            {keys.map((label) => {
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
                    <Stack.Item>
                      {/* Title Bar */}
                      <Stack
                        horizontal
                        tokens={{ childrenGap: "l1" }}
                        verticalAlign="center"
                      >
                        <Stack.Item>
                          <Text variant="xLarge">Label {label}</Text>
                        </Stack.Item>
                        <Stack.Item>
                          <Text variant="medium">
                            {list.length}/580 examples
                          </Text>
                        </Stack.Item>
                        <Stack.Item>
                          <Stack horizontal verticalAlign="center">
                            <Stack.Item>
                              <div
                                style={{
                                  backgroundColor: "#5E9EFF",
                                  height: 10,
                                  width: 100 * (list.length / 580)
                                }}
                              />
                            </Stack.Item>
                            <Stack.Item>
                              <div
                                style={{
                                  backgroundColor: "#D9D9D9",
                                  height: 10,
                                  width: 100 - 100 * (list.length / 580)
                                }}
                              />
                            </Stack.Item>
                          </Stack>
                        </Stack.Item>
                      </Stack>
                    </Stack.Item>
                  )}
                  {this.state.labelVisibilities.get(label.toString()) && (
                    <Stack
                      horizontal
                      horizontalAlign="center"
                      verticalAlign="center"
                    >
                      <Stack.Item
                        style={{
                          width: "100%"
                        }}
                      >
                        {/* Images */}
                        <List
                          items={list}
                          onRenderCell={this.onRenderCell}
                          getPageSpecification={this.getPageSpecification}
                        />
                      </Stack.Item>
                      <Stack.Item
                        style={{ bottom: 5, position: "relative", right: 50 }}
                      >
                        <Icon iconName="DoubleChevronRight12" />
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
      <div
        data-is-focusable
        className={classNames.tile}
        onClick={this.callbackWrapper(item)}
        onKeyPress={this.callbackWrapper(item)}
        role="button"
        tabIndex={0}
      >
        <Image
          alt={item?.predictedY}
          width={this.props.imageDim}
          height={this.props.imageDim}
          imageFit={ImageFit.cover}
          src={`data:image/jpg;base64,${item?.image}`}
        />
        <div
          className={
            item.predictedY === item.trueY
              ? classNames.successIndicator
              : classNames.errorIndicator
          }
          style={{ marginBottom: 20, width: this.props.imageDim }}
        />
      </div>
    );
  };

  private callbackWrapper = (item: IVisionListItem) => () => {
    this.props.selectItem(item);
  };

  private getPageSpecification = (
    itemIndex?: number,
    visibleRect?: IRectangle
  ): IPageSpecification => {
    console.log(itemIndex, visibleRect);
    if (!visibleRect) {
      return { height: 0, itemCount: 0 };
    }
    return {
      height: this.props.imageDim + 20,
      itemCount: (visibleRect.width - 100) / (this.props.imageDim + 20)
    };
  };

  private showAll = () => {
    const visibilities = this.state.labelVisibilities;

    for (const label of visibilities.keys()) {
      visibilities.set(label, true);
    }
    this.setState({ labelVisibilities: visibilities });
  };
}
