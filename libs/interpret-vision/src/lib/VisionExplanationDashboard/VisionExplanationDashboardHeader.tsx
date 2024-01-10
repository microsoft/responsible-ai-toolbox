// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  mergeStyles,
  Stack,
  Slider,
  Separator,
  Text,
  PivotItem,
  IDropdownOption
} from "@fluentui/react";
import {
  DatasetTaskType,
  ErrorCohort,
  IVisionListItem
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { CohortToolBar } from "./Controls/CohortToolBar";
import { IDatasetExplorerTabStyles } from "./Controls/ImageList.styles";
import { PageSizeSelectors } from "./Controls/PageSizeSelectors";
import { Pivots } from "./Controls/Pivots";
import { ToolBar } from "./Controls/ToolBar";
import { IVisionExplanationDashboardStyles } from "./VisionExplanationDashboard.styles";
import { VisionDatasetExplorerTabOptions } from "./VisionExplanationDashboardHelper";

export interface IVisionExplanationDashboardHeaderProps {
  cohorts: ErrorCohort[];
  selectedKey: string;
  searchValue: string;
  selectedCohort: ErrorCohort;
  searchResultsAriaLabel: string;
  imageStyles: IProcessedStyleSet<IDatasetExplorerTabStyles>;
  classNames: IProcessedStyleSet<IVisionExplanationDashboardStyles>;
  taskType: string;
  selectedIndices: number[];
  handleLinkClick: (item?: PivotItem) => void;
  setSelectedCohort: (cohort: ErrorCohort) => void;
  onSliderChange: (value: number) => void;
  onNumRowsSelect: (
    _event: React.FormEvent<HTMLDivElement>,
    item: IDropdownOption | undefined
  ) => void;
  addCohortWrapper: (name: string, switchCohort: boolean) => void;
  onSearch: (
    _event?: React.ChangeEvent<HTMLInputElement>,
    newValue?: string
  ) => void;
}

export interface IVisionExplanationDashboardHeaderState {
  item: IVisionListItem | undefined;
  metadata: Array<Array<string | number | boolean>> | undefined;
}

export class VisionExplanationDashboardHeader extends React.Component<
  IVisionExplanationDashboardHeaderProps,
  IVisionExplanationDashboardHeaderState
> {
  public render(): React.ReactNode {
    return (
      <Stack>
        <Stack.Item>
          <Pivots
            selectedKey={this.props.selectedKey}
            onLinkClick={this.props.handleLinkClick}
          />
        </Stack.Item>
        <Stack.Item>
          <Separator styles={{ root: { width: "100%" } }} />
        </Stack.Item>
        <Stack.Item>
          <ToolBar
            cohorts={this.props.cohorts}
            searchResultsAriaLabel={this.props.searchResultsAriaLabel}
            searchValue={this.props.searchValue}
            onSearch={this.props.onSearch}
            selectedCohort={this.props.selectedCohort}
            setSelectedCohort={this.props.setSelectedCohort}
          />
        </Stack.Item>
        <Stack.Item>
          <Stack
            horizontal
            horizontalAlign="space-between"
            verticalAlign="start"
            className={this.props.classNames.lowerToolbarContainer}
          >
            <Stack.Item>
              <Slider
                max={80}
                min={20}
                id="dataExplorerThumbnailSize"
                className={this.props.classNames.slider}
                ariaLabel={localization.InterpretVision.Dashboard.thumbnailSize}
                label={localization.InterpretVision.Dashboard.thumbnailSize}
                defaultValue={50}
                showValue={false}
                onChange={this.props.onSliderChange}
                disabled={
                  this.props.selectedKey ===
                  VisionDatasetExplorerTabOptions.ClassView
                }
              />
            </Stack.Item>
            {this.props.selectedKey ===
              VisionDatasetExplorerTabOptions.ClassView && (
              <Stack.Item>
                <PageSizeSelectors
                  selectedKey={this.props.selectedKey}
                  onNumRowsSelect={this.props.onNumRowsSelect}
                />
              </Stack.Item>
            )}
            {this.props.selectedKey ===
              VisionDatasetExplorerTabOptions.ImageExplorerView &&
              this.props.taskType !== DatasetTaskType.ObjectDetection && (
                <Stack
                  horizontal
                  tokens={{ childrenGap: "l1" }}
                  verticalAlign="center"
                >
                  <Stack.Item id="predictedLabel">
                    <Text>
                      {localization.InterpretVision.Dashboard.predictedLabel}
                    </Text>
                  </Stack.Item>
                  <Stack.Item
                    id="legendFailure"
                    className={mergeStyles(
                      this.props.imageStyles.errorIndicator,
                      this.props.classNames.legendIndicator
                    )}
                  >
                    <Text className={this.props.imageStyles.labelPredicted}>
                      {localization.InterpretVision.Dashboard.legendFailure}
                    </Text>
                  </Stack.Item>
                  <Stack.Item
                    id="legendSuccess"
                    className={mergeStyles(
                      this.props.imageStyles.successIndicator,
                      this.props.classNames.legendIndicator
                    )}
                  >
                    <Text className={this.props.imageStyles.labelPredicted}>
                      {localization.InterpretVision.Dashboard.legendSuccess}
                    </Text>
                  </Stack.Item>
                </Stack>
              )}
          </Stack>
        </Stack.Item>
        {this.props.selectedKey ===
          VisionDatasetExplorerTabOptions.TableView && (
          <Stack.Item>
            <CohortToolBar
              addCohort={this.props.addCohortWrapper}
              cohorts={this.props.cohorts}
              selectedIndices={this.props.selectedIndices}
            />
          </Stack.Item>
        )}
      </Stack>
    );
  }
}
