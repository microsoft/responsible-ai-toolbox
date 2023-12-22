// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from "@fluentui/react";
import {
  IVisionListItem,
  ErrorCohort,
  DatasetTaskType
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { updateSearchTextAriaLabel } from "../utils/searchTextUtils";
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
  searchValue: string;
  selectedItem: IVisionListItem | undefined;
  selectedKey: string;
  onItemSelect: (item: IVisionListItem) => void;
  onSearchUpdated: (searchResultsAriaLabel: string) => void;
  updateSelectedIndices: (indices: number[]) => void;
  selectedCohort: ErrorCohort;
  setSelectedCohort: (cohort: ErrorCohort) => void;
  taskType: string;
}

export interface ITabViewState {
  items: IVisionListItem[];
  errorInstancesCount?: number;
  successInstancesCount?: number;
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
    if (
      this.props.searchValue !== prevProps.searchValue &&
      (!this.props.searchValue || this.props.searchValue === "")
    ) {
      this.setState({
        errorInstancesCount: undefined,
        successInstancesCount: undefined
      });
      const label = localization.InterpretVision.Search.defaultSearchLabel;
      this.props.onSearchUpdated(label);
    }
  }

  public render(): React.ReactNode {
    const classNames = visionExplanationDashboardStyles();
    switch (this.props.selectedKey) {
      case VisionDatasetExplorerTabOptions.ClassView:
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
                onSearchUpdated={this.onSearchCountUpdated}
                searchValue={this.props.searchValue}
                selectItem={this.props.onItemSelect}
                taskType={this.props.taskType}
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
              onSearchUpdated={this.onSearchCountUpdated}
              searchValue={this.props.searchValue}
              selectItem={this.props.onItemSelect}
              updateSelectedIndices={this.props.updateSelectedIndices}
              taskType={this.props.taskType}
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
              {this.props.taskType === DatasetTaskType.ObjectDetection ? (
                <Stack
                  id="objectDetectionImageContainer"
                  className={classNames.mainContainer}
                  tokens={stackTokens}
                >
                  <Stack
                    className={classNames.objectDetectionContainer}
                    tokens={stackTokens}
                  >
                    <ImageList
                      items={this.state.items}
                      imageDim={this.props.imageDim}
                      onSearchUpdated={this.onSearchCountUpdated}
                      searchValue={this.props.searchValue}
                      selectItem={this.props.onItemSelect}
                      taskType={this.props.taskType}
                    />
                  </Stack>
                </Stack>
              ) : (
                <Stack
                  horizontal
                  className={classNames.mainContainer}
                  tokens={stackTokens}
                >
                  <Stack
                    className={classNames.halfContainer}
                    tokens={stackTokens}
                  >
                    <Stack.Item id="errorInstances">
                      <TitleBar
                        count={this.props.errorInstances.length}
                        type={TitleBarOptions.Error}
                      />
                    </Stack.Item>
                    <Stack.Item
                      className={classNames.imageListContainer}
                      id="errorImageContainer"
                    >
                      <ImageList
                        items={this.props.errorInstances}
                        imageDim={this.props.imageDim}
                        onSearchUpdated={this.onSearchUpdatedError}
                        searchValue={this.props.searchValue}
                        selectItem={this.props.onItemSelect}
                        taskType={this.props.taskType}
                      />
                    </Stack.Item>
                  </Stack>
                  <Stack
                    className={classNames.halfContainer}
                    tokens={stackTokens}
                  >
                    <Stack.Item id="successInstances">
                      <TitleBar
                        count={this.props.successInstances.length}
                        type={TitleBarOptions.Success}
                      />
                    </Stack.Item>
                    <Stack.Item
                      className={classNames.imageListContainer}
                      id="successImageContainer"
                    >
                      <ImageList
                        items={this.props.successInstances}
                        imageDim={this.props.imageDim}
                        onSearchUpdated={this.onSearchUpdatedSuccess}
                        searchValue={this.props.searchValue}
                        selectItem={this.props.onItemSelect}
                        taskType={this.props.taskType}
                      />
                    </Stack.Item>
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Stack>
        );
    }
  }

  private onSearchCountUpdated = (
    successCount: number,
    errorCount: number
  ): void => {
    updateSearchTextAriaLabel(
      this.props.onSearchUpdated,
      successCount,
      errorCount,
      this.props.searchValue
    );
  };

  private updateSuccessErrorInstancesAriaLabel = (): void => {
    this.onSearchCountUpdated(
      this.state.successInstancesCount ?? 0,
      this.state.errorInstancesCount ?? 0
    );
  };

  private onSearchUpdatedError = (_: number, errorCount: number): void => {
    this.setState({ errorInstancesCount: errorCount }, () => {
      this.updateSuccessErrorInstancesAriaLabel();
    });
  };

  private onSearchUpdatedSuccess = (successCount: number): void => {
    this.setState({ successInstancesCount: successCount }, () => {
      this.updateSuccessErrorInstancesAriaLabel();
    });
  };
}
