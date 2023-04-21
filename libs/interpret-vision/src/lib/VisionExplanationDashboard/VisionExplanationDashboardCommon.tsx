// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  mergeStyles,
  Stack,
  Slider,
  Separator,
  Text,
} from "@fluentui/react";
import {
  IVisionListItem
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { CohortToolBar } from "./Controls/CohortToolBar";
import { IDatasetExplorerTabStyles } from "./Controls/ImageList.styles"
import { PageSizeSelectors } from "./Controls/PageSizeSelectors";
import { Pivots } from "./Controls/Pivots";
import { ToolBar } from "./Controls/ToolBar";
import { VisionExplanationDashboard } from "./VisionExplanationDashboard";
import { IVisionExplanationDashboardStyles } from "./VisionExplanationDashboard.styles";
import {
  VisionDatasetExplorerTabOptions,
} from "./VisionExplanationDashboardHelper";

export interface IVisionExplanationDashboardCommonProps {
  thisdashboard: VisionExplanationDashboard;
  imageStyles: IProcessedStyleSet<IDatasetExplorerTabStyles>;
  classNames: IProcessedStyleSet<IVisionExplanationDashboardStyles>; 
}

export interface IVisionExplanationDashboardCommonState {
  item: IVisionListItem | undefined;
  metadata: Array<Array<string | number | boolean>> | undefined;
}


export class VisionExplanationDashboardCommon extends React.Component<IVisionExplanationDashboardCommonProps, IVisionExplanationDashboardCommonState> {
  public render(): React.ReactNode {
    return ( 
    <Stack>
        <Stack.Item>
          <Pivots
            selectedKey={this.props.thisdashboard.state.selectedKey}
            onLinkClick={this.props.thisdashboard.handleLinkClick}
          />
        </Stack.Item>
        <Stack.Item>
          <Separator styles={{ root: { width: "100%" } }} />
        </Stack.Item>
        <Stack.Item>
          <ToolBar
            cohorts={this.props.thisdashboard.props.cohorts}
            searchValue={this.props.thisdashboard.state.searchValue}
            onSearch={this.props.thisdashboard.onSearch}
            selectedCohort={this.props.thisdashboard.props.selectedCohort}
            setSelectedCohort={this.props.thisdashboard.props.setSelectedCohort}
          />
        </Stack.Item>
        <Stack.Item>
          <Stack
            horizontal
            horizontalAlign="space-between"
            verticalAlign="start"
          >
            <Stack.Item>
              <Slider
                max={80}
                min={20}
                className={this.props.classNames.slider}
                label={localization.InterpretVision.Dashboard.thumbnailSize}
                defaultValue={50}
                showValue={false}
                onChange={this.props.thisdashboard.onSliderChange}
                disabled={
                  this.props.thisdashboard.state.selectedKey ===
                  VisionDatasetExplorerTabOptions.ClassView
                }
              />
            </Stack.Item>
            {this.props.thisdashboard.state.selectedKey !==
            VisionDatasetExplorerTabOptions.ImageExplorerView ? (
              <Stack.Item>
                <PageSizeSelectors
                  selectedKey={this.props.thisdashboard.state.selectedKey}
                  onNumRowsSelect={this.props.thisdashboard.onNumRowsSelect}
                  onPageSizeSelect={this.props.thisdashboard.onPageSizeSelect}
                />
              </Stack.Item>
            ) : (
              <Stack
                horizontal
                tokens={{ childrenGap: "l1" }}
                verticalAlign="center"
              >
                <Stack.Item>
                  <Text>
                    {localization.InterpretVision.Dashboard.predictedLabel}
                  </Text>
                </Stack.Item>
                <Stack.Item
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
        {this.props.thisdashboard.state.selectedKey ===
          VisionDatasetExplorerTabOptions.TableView && (
          <Stack.Item>
            <CohortToolBar
              addCohort={this.props.thisdashboard.addCohortWrapper}
              cohorts={this.props.thisdashboard.props.cohorts}
              selectedIndices={this.props.thisdashboard.state.selectedIndices}
            />
          </Stack.Item>
        )}
    </Stack>
    )
  }
}