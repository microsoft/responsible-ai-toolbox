// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from "@fluentui/react";
import { IVisionListItem, ErrorCohort } from "@responsible-ai/core-ui";
import React from "react";

import { visionExplanationDashboardStyles } from "../VisionExplanationDashboard.styles";
import {
  TitleBarOptions,
  VisionDatasetExplorerTabOptions
} from "../VisionExplanationDashboardHelper";

import { DataCharacteristics } from "./DataCharacteristics";
import { ImageList } from "./ImageList";
import { TableList } from "./TableList";
import { TitleBar } from "./TitleBar";

export interface ITabsViewProps {
  addCohort: (name: string, switchCohort: boolean) => void;
  errorInstances: IVisionListItem[];
  successInstances: IVisionListItem[];
  imageDim: number;
  numRows: number;
  otherMetadataFieldNames: string[];
  pageSize: number;
  searchValue: string;
  selectedItem: IVisionListItem | undefined;
  selectedKey: string;
  onItemSelect: (item: IVisionListItem) => void;
  updateSelectedIndices: (indices: number[]) => void;
  selectedCohort: ErrorCohort;
  setSelectedCohort: (cohort: ErrorCohort) => void;
}

export interface ITabViewState {
  items: IVisionListItem[];
}

const stackTokens = {
  childrenGap: "l1"
};

export class TabsView extends React.Component<ITabsViewProps, ITabViewState> {
  public constructor(props: ITabsViewProps) {
    super(props);
    this.state = {
      items: this.props.errorInstances.concat(...this.props.successInstances)
    };
  }

  public componentDidUpdate(prevProps: ITabsViewProps): void {
    if (
      this.props.errorInstances !== prevProps.errorInstances ||
      this.props.successInstances !== prevProps.successInstances
    ) {
      this.setState({
        items: this.props.errorInstances.concat(...this.props.successInstances)
      });
    }
  }

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
                items={this.state.items}
                imageDim={this.props.imageDim}
                numRows={this.props.numRows}
                searchValue={this.props.searchValue}
                selectItem={this.props.onItemSelect}
              />
            </Stack.Item>
          </Stack>
        );
      case VisionDatasetExplorerTabOptions.TableView:
        return (
          <Stack className={classNames.mainContainer}>
            <TableList
              addCohort={this.props.addCohort}
              errorInstances={this.props.errorInstances}
              successInstances={this.props.successInstances}
              imageDim={this.props.imageDim}
              otherMetadataFieldNames={this.props.otherMetadataFieldNames}
              searchValue={this.props.searchValue}
              selectItem={this.props.onItemSelect}
              pageSize={this.props.pageSize}
              updateSelectedIndices={this.props.updateSelectedIndices}
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
                    items={this.props.errorInstances}
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
                    items={this.props.successInstances}
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
