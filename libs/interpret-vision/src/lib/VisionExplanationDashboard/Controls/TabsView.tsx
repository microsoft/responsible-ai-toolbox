// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from "@fluentui/react";
import { IVisionListItem } from "@responsible-ai/core-ui";
import React from "react";

import {
  TitleBarOptions,
  VisionDatasetExplorerTabOptions
} from "../VisionExplanationDashboard";
import { visionExplanationDashboardStyles } from "../VisionExplanationDashboard.styles";

import { DataCharacteristics } from "./DataCharacteristics";
import { ImageList } from "./ImageList";
import { TableList } from "./TableList";
import { TitleBar } from "./TitleBar";

export interface ITabsViewProps {
  errorInstances: IVisionListItem[];
  successInstances: IVisionListItem[];
  imageDim: number;
  numRows: number;
  pageSize: number;
  searchValue: string;
  selectedItem: IVisionListItem | undefined;
  selectedKey: string;
  onItemSelect: (item: IVisionListItem) => void;
}

const stackTokens = {
  childrenGap: "l1"
};

export class TabsView extends React.Component<ITabsViewProps> {
  public render(): React.ReactNode {
    const classNames = visionExplanationDashboardStyles();
    switch (this.props.selectedKey) {
      case VisionDatasetExplorerTabOptions.DataCharacteristics:
        return (
          <Stack
            className={classNames.mainContainer}
            tokens={{ childrenGap: "l1" }}
          >
            <Stack.Item style={{ width: "100%" }}>
              <DataCharacteristics
                data={this.props.errorInstances.concat(
                  ...this.props.successInstances
                )}
                imageDim={this.props.imageDim}
                numRows={this.props.numRows}
                selectItem={this.props.onItemSelect}
              />
            </Stack.Item>
          </Stack>
        );
      case VisionDatasetExplorerTabOptions.TableView:
        return (
          <Stack className={classNames.mainContainer}>
            <TableList
              errorInstances={this.props.errorInstances}
              successInstances={this.props.successInstances}
              imageDim={this.props.imageDim}
              searchValue={this.props.searchValue}
              selectItem={this.props.onItemSelect}
              pageSize={this.props.pageSize}
            />
          </Stack>
        );
      default:
        return (
          <Stack horizontal={false} grow tokens={stackTokens}>
            <Stack
              horizontal
              tokens={stackTokens}
              className={classNames.mainImageContainer}
            >
              <Stack className={classNames.halfContainer} tokens={stackTokens}>
                <Stack.Item>
                  <TitleBar
                    count={this.props.errorInstances.length}
                    type={TitleBarOptions.Error}
                  />
                </Stack.Item>
                <Stack.Item className={classNames.imageListContainer}>
                  <ImageList
                    data={this.props.errorInstances}
                    imageDim={this.props.imageDim}
                    searchValue={this.props.searchValue}
                    selectItem={this.props.onItemSelect}
                  />
                </Stack.Item>
              </Stack>
              <Stack className={classNames.halfContainer} tokens={stackTokens}>
                <Stack.Item>
                  <TitleBar
                    count={this.props.successInstances.length}
                    type={TitleBarOptions.Success}
                  />
                </Stack.Item>
                <Stack.Item className={classNames.imageListContainer}>
                  <ImageList
                    data={this.props.successInstances}
                    imageDim={this.props.imageDim}
                    searchValue={this.props.searchValue}
                    selectItem={this.props.onItemSelect}
                  />
                </Stack.Item>
              </Stack>
            </Stack>
          </Stack>
        );
    }
  }
}
