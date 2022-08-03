// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IDropdownOption,
  Dropdown,
  Text,
  Stack,
  Pivot,
  PivotItem,
  SearchBox,
  Slider,
  CommandBarButton
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { ImageList } from "./Controls/ImageList";
import { TitleBar } from "./Controls/TitleBar";
import { IVisionExplanationDashboardProps } from "./Interfaces/IExplanationDashboardProps";
import { visionExplanationDashboardStyles } from "./VisionExplanationDashboard.styles";

export interface IVisionExplanationDashboardState {
  imageDim: number;
  panelOpen: boolean;
  selectedKey: string;
}

enum VisionDatasetExplorerTabOptions {
  ImageExplorerView = "Image explorer view",
  TableView = "Table view",
  DataCharacteristics = "Data characteristics"
}

export enum TitleBarOptions {
  Error,
  Success
}

export class VisionExplanationDashboard extends React.Component<
  IVisionExplanationDashboardProps,
  IVisionExplanationDashboardState
> {
  public constructor(props: IVisionExplanationDashboardProps) {
    super(props);

    this.state = {
      imageDim: 200,
      panelOpen: false,
      selectedKey: VisionDatasetExplorerTabOptions.ImageExplorerView
    };
  }

  public render(): React.ReactNode {
    const classNames = visionExplanationDashboardStyles();
    const dropdownOptions: Array<IDropdownOption<unknown>> = [
      { key: 0, text: localization.InterpretVision.Dashboard.allData }
    ];

    return (
      <Stack
        horizontal={false}
        grow
        tokens={{ childrenGap: "l1", padding: "m 40px" }}
      >
        <Stack.Item>
          <Stack horizontal horizontalAlign="space-between" verticalAlign="end">
            <Stack.Item>
              <Pivot
                selectedKey={this.state.selectedKey}
                onLinkClick={this.handleLinkClick}
                linkSize={"normal"}
                headersOnly
                className={classNames.tabs}
              >
                <PivotItem
                  headerText={
                    localization.InterpretVision.Dashboard.tabOptionFirst
                  }
                  itemKey={VisionDatasetExplorerTabOptions.ImageExplorerView}
                />
                <PivotItem
                  headerText={
                    localization.InterpretVision.Dashboard.tabOptionSecond
                  }
                  itemKey={VisionDatasetExplorerTabOptions.TableView}
                />
                <PivotItem
                  headerText={
                    localization.InterpretVision.Dashboard.tabOptionThird
                  }
                  itemKey={VisionDatasetExplorerTabOptions.DataCharacteristics}
                />
              </Pivot>
            </Stack.Item>
            <Stack.Item>
              <CommandBarButton
                className={classNames.filterButton}
                iconProps={{ iconName: "Settings" }}
                text={localization.InterpretVision.Dashboard.settings}
              />
            </Stack.Item>
          </Stack>
        </Stack.Item>
        <Stack.Item>
          <div className={classNames.line} />
        </Stack.Item>
        <Stack.Item>
          <Stack>
            <Stack.Item className={classNames.cohortPickerLabelWrapper}>
              <Text
                variant="mediumPlus"
                className={classNames.cohortPickerLabel}
              >
                {localization.Interpret.ModelPerformance.cohortPickerLabel}
              </Text>
            </Stack.Item>
            <Stack.Item>
              <Stack
                horizontal
                className={classNames.toolBarContainer}
                tokens={{ childrenGap: "l1" }}
                verticalAlign="center"
              >
                <Stack.Item>
                  <Dropdown
                    className={classNames.cohortDropdown}
                    id="dataExplorerCohortDropdown"
                    options={dropdownOptions}
                    selectedKey={0}
                  />
                </Stack.Item>
                <Stack.Item>
                  <SearchBox
                    className={classNames.searchBox}
                    placeholder={localization.InterpretVision.Dashboard.search}
                  />
                </Stack.Item>
                <Stack.Item>
                  <CommandBarButton
                    className={classNames.filterButton}
                    iconProps={{ iconName: "Filter" }}
                    text={localization.InterpretVision.Dashboard.filter}
                  />
                </Stack.Item>
              </Stack>
            </Stack.Item>
          </Stack>
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
                className={classNames.slider}
                label={localization.InterpretVision.Dashboard.thumbnailSize}
                defaultValue={40}
                showValue={false}
                onChange={this.onSliderChange}
              />
            </Stack.Item>
          </Stack>
        </Stack.Item>
        {this.state.selectedKey ===
          VisionDatasetExplorerTabOptions.ImageExplorerView && (
          <Stack horizontal={false} grow tokens={{ childrenGap: "l1" }}>
            <Stack
              horizontal
              tokens={{ childrenGap: "l1" }}
              /* Height calculated as approximately three times the image height so as to create three rows, 
              with extra space added for the image labels */
              style={{
                height:
                  this.state.imageDim * 3 + Math.floor(this.state.imageDim / 2)
              }}
            >
              <Stack
                className={classNames.halfContainer}
                tokens={{ childrenGap: "l1" }}
              >
                <Stack.Item>
                  <TitleBar type={TitleBarOptions.Error} />
                </Stack.Item>
                <Stack.Item className={classNames.imageListContainer}>
                  <ImageList
                    imageDim={this.state.imageDim}
                    openPanel={this.onButtonClick}
                  />
                </Stack.Item>
              </Stack>
              <Stack
                className={classNames.halfContainer}
                tokens={{ childrenGap: "l1" }}
              >
                <Stack.Item>
                  <TitleBar type={TitleBarOptions.Success} />
                </Stack.Item>
                <Stack.Item className={classNames.imageListContainer}>
                  <ImageList
                    imageDim={this.state.imageDim}
                    openPanel={this.onButtonClick}
                  />
                </Stack.Item>
              </Stack>
            </Stack>
          </Stack>
        )}
      </Stack>
    );
  }

  private onButtonClick = () => {
    this.setState({ panelOpen: !this.state.panelOpen });
  };

  /* For onSliderChange, the max imageDims for each tab (400 and 100) are selected arbitrary to 
  look close to the Figma design sketch. For handleLinkClick, the default values chosen are half
  the maximum values chosen in onSliderChange. */

  private onSliderChange = (value: number) => {
    if (
      this.state.selectedKey ===
      VisionDatasetExplorerTabOptions.ImageExplorerView
    ) {
      this.setState({ imageDim: Math.floor((value / 100) * 400) });
    } else {
      this.setState({ imageDim: Math.floor((value / 100) * 100) });
    }
  };

  private handleLinkClick = (item?: PivotItem) => {
    if (item) {
      this.setState({ selectedKey: item.props.itemKey! });
      if (
        item.props.itemKey === VisionDatasetExplorerTabOptions.ImageExplorerView
      ) {
        this.setState({ imageDim: 200 });
      } else {
        this.setState({ imageDim: 50 });
      }
    }
  };
}
