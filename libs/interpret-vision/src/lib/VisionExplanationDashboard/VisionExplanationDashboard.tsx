// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IDropdownOption,
  Stack,
  PivotItem,
  Slider,
  Separator
} from "@fluentui/react";
import { IVisionListItem } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { Flyout } from "./Controls/Flyout";
import { PageSizeSelectors } from "./Controls/PageSizeSelectors";
import { Pivots } from "./Controls/Pivots";
import { TabsView } from "./Controls/TabsView";
import { ToolBar } from "./Controls/ToolBar";
import { IVisionExplanationDashboardProps } from "./Interfaces/IExplanationDashboardProps";
import { visionExplanationDashboardStyles } from "./VisionExplanationDashboard.styles";

export interface IVisionExplanationDashboardState {
  currentExplanation: string;
  errorInstances: IVisionListItem[];
  successInstances: IVisionListItem[];
  imageDim: number;
  loadingExplanation: boolean;
  otherMetadataFieldName: string;
  numRows: number;
  pageSize: number;
  panelOpen: boolean;
  searchValue: string;
  selectedItem: IVisionListItem | undefined;
  selectedKey: string;
}

export enum VisionDatasetExplorerTabOptions {
  ImageExplorerView = "Image explorer view",
  TableView = "Table view",
  DataCharacteristics = "Data characteristics"
}

export enum TitleBarOptions {
  Error,
  Success
}

const defaultImageSizes = {
  dataCharacteristics: 100,
  imageExplorerView: 200,
  tableView: 50
};

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
      otherMetadataFieldName: "mean_pixel_value",
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
    return (
      <Stack
        horizontal={false}
        grow
        tokens={{ childrenGap: "l1", padding: "m 40px" }}
      >
        <Stack.Item>
          <Pivots
            selectedKey={this.state.selectedKey}
            onLinkClick={this.handleLinkClick}
          />
        </Stack.Item>
        <Stack.Item>
          <Separator styles={{ root: { width: "100%" } }} />
        </Stack.Item>
        <Stack.Item>
          <ToolBar
            searchValue={this.state.searchValue}
            onSearch={this.onSearch}
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
                <PageSizeSelectors
                  selectedKey={this.state.selectedKey}
                  onNumRowsSelect={this.onNumRowsSelect}
                  onPageSizeSelect={this.onPageSizeSelect}
                />
              </Stack.Item>
            )}
          </Stack>
        </Stack.Item>
        <Stack.Item>
          <TabsView
            errorInstances={this.state.errorInstances}
            successInstances={this.state.successInstances}
            imageDim={this.state.imageDim}
            numRows={this.state.numRows}
            otherMetadataFieldName={this.state.otherMetadataFieldName}
            pageSize={this.state.pageSize}
            searchValue={this.state.searchValue}
            selectedItem={this.state.selectedItem}
            selectedKey={this.state.selectedKey}
            onItemSelect={this.onItemSelect}
          />
        </Stack.Item>
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

    const predictedY = dataSummary.predicted_y.map((index) => {
      return dataSummary.class_names[index];
    });

    const trueY = dataSummary.true_y.map((index) => {
      return dataSummary.class_names[index];
    });

    const features: number[] = dataSummary.features!.map((featuresArr) => {
      return featuresArr[0] as number;
    });

    const fieldName = dataSummary.feature_names![0];

    dataSummary.images?.forEach((image, index) => {
      const item: IVisionListItem = {
        [fieldName]: features[index],
        image,
        index,
        predictedY: predictedY[index],
        trueY: trueY[index]
      };
      item.predictedY === item.trueY
        ? successInstances.push(item)
        : errorInstances.push(item);
    });

    this.setState({
      errorInstances,
      otherMetadataFieldName: fieldName,
      successInstances
    });
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
    _event: React.FormEvent<HTMLDivElement>,
    item: IDropdownOption | undefined
  ): void => {
    this.setState({ numRows: Number(item?.text) });
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
        this.setState({ imageDim: defaultImageSizes.imageExplorerView });
      } else if (
        item.props.itemKey === VisionDatasetExplorerTabOptions.TableView
      ) {
        this.setState({ imageDim: defaultImageSizes.tableView });
      } else {
        this.setState({ imageDim: defaultImageSizes.dataCharacteristics });
      }
    }
  };
}
