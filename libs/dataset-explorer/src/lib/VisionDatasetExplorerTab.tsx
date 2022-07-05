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

import { DataCharacteristics } from "./DataCharacteristics";
import { Flyout } from "./Flyout";
import { ImageList } from "./ImageList";
import { TableList } from "./TableList";
import { TitleBar } from "./TitleBar";
import { visionDatasetExplorerTabStyles } from "./VisionDatasetExplorerTab.styles";

export class IVisionDatasetExplorerTabProps {}

export interface IVisionDatasetExplorerTabState {
  imageDim: number;
  pageSize: number;
  panelOpen: boolean;
  selectedKey: string;
}

enum VisionDatasetExplorerTabOptions {
  First = "Image explorer view",
  Second = "Table view",
  Third = "Data characteristics"
}

export enum TitleBarOptions {
  Error,
  Success
}

const PageSizeOptions: IDropdownOption[] = [
  { key: "s", text: "10" },
  { key: "m", text: "25" },
  { key: "l", text: "50" },
  { key: "xl", text: "100" }
];
const EnableHelperText = false;
export class VisionDatasetExplorerTab extends React.Component<
  IVisionDatasetExplorerTabProps,
  IVisionDatasetExplorerTabState
> {
  public constructor(props: IVisionDatasetExplorerTabProps) {
    super(props);

    this.state = {
      imageDim: 200,
      pageSize: 10,
      panelOpen: false,
      selectedKey: VisionDatasetExplorerTabOptions.First
    };
  }

  public render(): React.ReactNode {
    const classNames = visionDatasetExplorerTabStyles();
    const DropdownOptions: Array<IDropdownOption<any>> = [
      { key: 0, text: "All Data" }
    ];

    return (
      <Stack
        horizontal={false}
        grow
        tokens={{ childrenGap: "l1" }}
        className={classNames.page}
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
                    localization.Interpret.VisionDatasetExplorer.tabOptionFirst
                  }
                  itemKey={VisionDatasetExplorerTabOptions.First}
                />
                <PivotItem
                  headerText={
                    localization.Interpret.VisionDatasetExplorer.tabOptionSecond
                  }
                  itemKey={VisionDatasetExplorerTabOptions.Second}
                />
                <PivotItem
                  headerText={
                    localization.Interpret.VisionDatasetExplorer.tabOptionThird
                  }
                  itemKey={VisionDatasetExplorerTabOptions.Third}
                />
              </Pivot>
            </Stack.Item>
            <Stack.Item>
              <CommandBarButton
                className={classNames.filterButton}
                iconProps={{ iconName: "Settings" }}
                text={localization.Interpret.VisionDatasetExplorer.settings}
              />
            </Stack.Item>
          </Stack>
        </Stack.Item>
        <Stack.Item>
          <div className={classNames.line} />
        </Stack.Item>
        {EnableHelperText && (
          <Stack.Item>
            <Text variant="medium">
              {localization.Interpret.VisionDatasetExplorer.helperText}
            </Text>
          </Stack.Item>
        )}
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
                    options={DropdownOptions}
                    selectedKey={0}
                  />
                </Stack.Item>
                <Stack.Item>
                  <SearchBox
                    className={classNames.searchBox}
                    placeholder="Search"
                  />
                </Stack.Item>
                <Stack.Item>
                  <CommandBarButton
                    className={classNames.filterButton}
                    iconProps={{ iconName: "Filter" }}
                    text={localization.Interpret.VisionDatasetExplorer.filter}
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
                label={
                  localization.Interpret.VisionDatasetExplorer.thumbnailSize
                }
                defaultValue={40}
                showValue={false}
                onChange={this.onSliderChange}
              />
            </Stack.Item>
            {this.state.selectedKey ===
              VisionDatasetExplorerTabOptions.Second && (
              <Stack.Item>
                <Stack
                  horizontal
                  tokens={{ childrenGap: "s1" }}
                  verticalAlign="center"
                >
                  <Stack.Item>
                    <Text>
                      {localization.Interpret.VisionDatasetExplorer.pageSize}
                    </Text>
                  </Stack.Item>
                  <Stack.Item>
                    <Dropdown
                      defaultSelectedKey="s"
                      options={PageSizeOptions}
                      onChange={this.onPageSizeSelect}
                    />
                  </Stack.Item>
                </Stack>
              </Stack.Item>
            )}
          </Stack>
        </Stack.Item>
        {this.state.selectedKey === VisionDatasetExplorerTabOptions.First && (
          <Stack horizontal={false} grow tokens={{ childrenGap: "l1" }}>
            <Stack
              horizontal
              tokens={{ childrenGap: "l1" }}
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
        {this.state.selectedKey === VisionDatasetExplorerTabOptions.Second && (
          <Stack className={classNames.mainContainer}>
            <TableList
              imageDim={this.state.imageDim}
              openPanel={this.onButtonClick}
              pageSize={this.state.pageSize}
            />
          </Stack>
        )}
        {this.state.selectedKey === VisionDatasetExplorerTabOptions.Third && (
          <Stack
            className={classNames.mainContainer}
            tokens={{ childrenGap: "l1" }}
          >
            <Stack.Item>
              <DataCharacteristics
                imageDim={this.state.imageDim}
                openPanel={this.onButtonClick}
              />
            </Stack.Item>
          </Stack>
        )}
        <Stack.Item>
          <Flyout
            isOpen={this.state.panelOpen}
            item={{ image: "hi", title: "hi" }}
            callback={this.onButtonClick}
          />
        </Stack.Item>
      </Stack>
    );
  }

  private onButtonClick = () => {
    this.setState({ panelOpen: !this.state.panelOpen });
  };

  private onPageSizeSelect = (
    event: React.FormEvent<HTMLDivElement>,
    item: IDropdownOption | undefined
  ): void => {
    this.setState({ pageSize: Number(item?.text) });
    if (event) {
      return;
    }
  };

  private onSliderChange = (value: number) => {
    if (this.state.selectedKey === VisionDatasetExplorerTabOptions.First) {
      this.setState({ imageDim: Math.floor((value / 100) * 400) });
    } else {
      this.setState({ imageDim: Math.floor((value / 100) * 100) });
    }
  };

  private handleLinkClick = (item?: PivotItem) => {
    if (item) {
      this.setState({ selectedKey: item.props.itemKey! });
      if (item.props.itemKey === VisionDatasetExplorerTabOptions.First) {
        this.setState({ imageDim: 200 });
      } else {
        this.setState({ imageDim: 50 });
      }
    }
  };
}
