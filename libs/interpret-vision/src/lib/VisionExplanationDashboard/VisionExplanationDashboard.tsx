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
  CommandBarButton,
  Separator
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { Flyout } from "./Controls/Flyout";
import { ImageList } from "./Controls/ImageList";
import { TableList } from "./Controls/TableList";
import { TitleBar } from "./Controls/TitleBar";
import { IVisionExplanationDashboardProps } from "./Interfaces/IExplanationDashboardProps";
import { visionExplanationDashboardStyles } from "./VisionExplanationDashboard.styles";

export interface IVisionExplanationDashboardState {
  imageDim: number;
  pageSize: number;
  panelOpen: boolean;
  selectedItem: IListItem | undefined;
  selectedKey: string;
}

export interface IListItem {
  title: string;
  subtitle?: string;
  image: string;
  trueY?: number;
  predictedY?: number;
  index?: number;
  other?: number;
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

const PageSizeOptions: IDropdownOption[] = [
  { key: "s", text: "10" },
  { key: "m", text: "25" },
  { key: "l", text: "50" },
  { key: "xl", text: "100" }
];
export class VisionExplanationDashboard extends React.Component<
  IVisionExplanationDashboardProps,
  IVisionExplanationDashboardState
> {
  public constructor(props: IVisionExplanationDashboardProps) {
    super(props);

    this.state = {
      imageDim: 200,
      pageSize: Number(PageSizeOptions[0].text),
      panelOpen: false,
      selectedItem: undefined,
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
          <Separator styles={{ root: { width: "100%" } }} />
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
                defaultValue={50}
                showValue={false}
                onChange={this.onSliderChange}
              />
            </Stack.Item>
            {this.state.selectedKey ===
              VisionDatasetExplorerTabOptions.TableView && (
              <Stack.Item>
                <Stack
                  horizontal
                  tokens={{ childrenGap: "s1" }}
                  verticalAlign="center"
                >
                  <Stack.Item>
                    <Text>
                      {localization.InterpretVision.Dashboard.pageSize}
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
        {this.state.selectedKey ===
          VisionDatasetExplorerTabOptions.ImageExplorerView && (
          <Stack horizontal={false} grow tokens={{ childrenGap: "l1" }}>
            <Stack
              horizontal
              tokens={{ childrenGap: "l1" }}
              className={classNames.mainImageContainer}
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
                    data={this.props.dataSummary}
                    imageDim={this.state.imageDim}
                    selectItem={this.onItemSelect}
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
                    data={this.props.dataSummary}
                    imageDim={this.state.imageDim}
                    selectItem={this.onItemSelect}
                  />
                </Stack.Item>
              </Stack>
            </Stack>
          </Stack>
        )}
        {this.state.selectedKey ===
          VisionDatasetExplorerTabOptions.TableView && (
          <Stack className={classNames.mainContainer}>
            <TableList
              data={this.props.dataSummary}
              imageDim={this.state.imageDim}
              selectItem={this.onItemSelect}
              pageSize={this.state.pageSize}
            />
          </Stack>
        )}
        <Stack.Item>
          <Flyout
            data={this.props.dataSummary}
            isOpen={this.state.panelOpen}
            item={this.state.selectedItem}
            callback={this.onPanelClose}
          />
        </Stack.Item>
      </Stack>
    );
  }

  private onPanelClose = () => {
    this.setState({ panelOpen: !this.state.panelOpen });
  };

  private onItemSelect = (item: IListItem): void => {
    this.setState({ panelOpen: !this.state.panelOpen, selectedItem: item });
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

  private onPageSizeSelect = (
    _event: React.FormEvent<HTMLDivElement>,
    item: IDropdownOption | undefined
  ): void => {
    this.setState({ pageSize: Number(item?.text) });
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
