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
import { IVisionListItem } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { DataCharacteristics } from "./Controls/DataCharacteristics";
import { Flyout } from "./Controls/Flyout";
import { ImageList } from "./Controls/ImageList";
import { TableList } from "./Controls/TableList";
import { TitleBar } from "./Controls/TitleBar";
import { IVisionExplanationDashboardProps } from "./Interfaces/IExplanationDashboardProps";
import { visionExplanationDashboardStyles } from "./VisionExplanationDashboard.styles";

export interface IVisionExplanationDashboardState {
  currentExplanation: string;
  errorInstances: IVisionListItem[];
  successInstances: IVisionListItem[];
  imageDim: number;
  loadingExplanation: boolean;
  numRows: number;
  pageSize: number;
  panelOpen: boolean;
  searchValue: string;
  selectedItem: IVisionListItem | undefined;
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

const PageSizeOptions: IDropdownOption[] = [
  { key: "s", text: "10" },
  { key: "m", text: "25" },
  { key: "l", text: "50" },
  { key: "xl", text: "100" }
];

const NumRowsOptions: IDropdownOption[] = [
  { key: "1", text: "1" },
  { key: "2", text: "2" },
  { key: "3", text: "3" },
  { key: "4", text: "4" },
  { key: "5", text: "5" }
];

export class VisionExplanationDashboard extends React.Component<
  IVisionExplanationDashboardProps,
  IVisionExplanationDashboardState
> {
  computedExplanations: Map<number, string>;

  public constructor(props: IVisionExplanationDashboardProps) {
    super(props);

    this.computedExplanations = new Map();
    this.state = {
      currentExplanation: "",
      errorInstances: [],
      imageDim: 200,
      loadingExplanation: false,
      numRows: 3,
      pageSize: 10,
      panelOpen: false,
      searchValue: "",
      selectedItem: undefined,
      selectedKey: VisionDatasetExplorerTabOptions.ImageExplorerView,
      successInstances: []
    };
  }

  public componentDidMount() {
    this.preprocessData();
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
                    value={this.state.searchValue}
                    onChange={this.onSearch}
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
                disabled={
                  this.state.selectedKey ===
                  VisionDatasetExplorerTabOptions.DataCharacteristics
                }
              />
            </Stack.Item>
            {this.state.selectedKey !==
              VisionDatasetExplorerTabOptions.ImageExplorerView && (
              <Stack.Item>
                <Stack
                  horizontal
                  tokens={{ childrenGap: "s1" }}
                  verticalAlign="center"
                >
                  <Stack.Item>
                    <Text>
                      {this.state.selectedKey ===
                      VisionDatasetExplorerTabOptions.TableView
                        ? localization.InterpretVision.Dashboard.pageSize
                        : localization.InterpretVision.Dashboard.rows}
                    </Text>
                  </Stack.Item>
                  <Stack.Item>
                    {this.state.selectedKey ===
                    VisionDatasetExplorerTabOptions.TableView ? (
                      <Dropdown
                        defaultSelectedKey="s"
                        options={PageSizeOptions}
                        onChange={this.onPageSizeSelect}
                      />
                    ) : (
                      <Dropdown
                        defaultSelectedKey="3"
                        options={NumRowsOptions}
                        onChange={this.onNumRowsSelect}
                      />
                    )}
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
                  <TitleBar
                    count={this.state.errorInstances.length}
                    type={TitleBarOptions.Error}
                  />
                </Stack.Item>
                <Stack.Item className={classNames.imageListContainer}>
                  <ImageList
                    data={this.state.errorInstances}
                    imageDim={this.state.imageDim}
                    searchValue={this.state.searchValue}
                    selectItem={this.onItemSelect}
                  />
                </Stack.Item>
              </Stack>
              <Stack
                className={classNames.halfContainer}
                tokens={{ childrenGap: "l1" }}
              >
                <Stack.Item>
                  <TitleBar
                    count={this.state.successInstances.length}
                    type={TitleBarOptions.Success}
                  />
                </Stack.Item>
                <Stack.Item className={classNames.imageListContainer}>
                  <ImageList
                    data={this.state.successInstances}
                    imageDim={this.state.imageDim}
                    searchValue={this.state.searchValue}
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
              errorInstances={this.state.errorInstances}
              successInstances={this.state.successInstances}
              imageDim={this.state.imageDim}
              selectItem={this.onItemSelect}
              pageSize={this.state.pageSize}
            />
          </Stack>
        )}
        {this.state.selectedKey ===
          VisionDatasetExplorerTabOptions.DataCharacteristics && (
          <Stack
            className={classNames.mainContainer}
            tokens={{ childrenGap: "l1" }}
          >
            <Stack.Item style={{ width: "100%" }}>
              <DataCharacteristics
                data={this.state.errorInstances.concat(
                  ...this.state.successInstances
                )}
                imageDim={this.state.imageDim}
                numRows={this.state.numRows}
                selectItem={this.onItemSelect}
              />
            </Stack.Item>
          </Stack>
        )}
        <Stack.Item>
          <Flyout
            explanation={this.state.currentExplanation}
            isOpen={this.state.panelOpen}
            item={this.state.selectedItem}
            loadingExplanation={this.state.loadingExplanation}
            callback={this.onPanelClose}
          />
        </Stack.Item>
      </Stack>
    );
  }

  private preprocessData() {
    const dataSummary = this.props.dataSummary;
    const errorInstances: IVisionListItem[] = this.state.errorInstances;
    const successInstances: IVisionListItem[] = this.state.successInstances;

    dataSummary.images.forEach((image, index) => {
      const item: IVisionListItem = {
        image,
        index,
        predictedY: dataSummary.predictedY[index],
        trueY: dataSummary.trueY[index]
      };
      item.predictedY === item.trueY
        ? successInstances.push(item)
        : errorInstances.push(item);
    });

    this.setState({ errorInstances, successInstances });
  }

  private onPanelClose = () => {
    this.setState({ currentExplanation: "", panelOpen: !this.state.panelOpen });
  };

  private onSearch = (
    _event?: React.ChangeEvent<HTMLInputElement>,
    newValue?: string
  ): void => {
    if (!newValue) {
      newValue = "";
    }
    this.setState({ searchValue: newValue });
  };

  private onItemSelect = (item: IVisionListItem): void => {
    this.setState({ panelOpen: !this.state.panelOpen, selectedItem: item });

    const index = item.index;

    const computedExplanation = this.computedExplanations.get(index);
    if (computedExplanation) {
      this.setState({
        currentExplanation: computedExplanation,
        loadingExplanation: false
      });
      return;
    }

    if (this.props.requestExp) {
      this.setState({ loadingExplanation: true });
      this.props
        .requestExp(index, new AbortController().signal)
        .then((result) => {
          const explanation = result.toString();
          this.computedExplanations.set(index, explanation);
          this.setState({
            currentExplanation: explanation,
            loadingExplanation: false
          });
        });
    }
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

  private onNumRowsSelect = (
    event: React.FormEvent<HTMLDivElement>,
    item: IDropdownOption | undefined
  ): void => {
    this.setState({ numRows: Number(item?.text) });
    if (event) {
      return;
    }
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

  private handleLinkClick = (item?: PivotItem) => {
    if (item) {
      this.setState({ selectedKey: item.props.itemKey! });
      if (
        item.props.itemKey === VisionDatasetExplorerTabOptions.ImageExplorerView
      ) {
        this.setState({ imageDim: 200 });
      } else if (
        item.props.itemKey === VisionDatasetExplorerTabOptions.TableView
      ) {
        this.setState({ imageDim: 50 });
      } else {
        this.setState({ imageDim: 100 });
      }
    }
  };
}
