// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDropdownOption, Stack, PivotItem } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  IVisionListItem,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import React from "react";

import { Flyout } from "./Controls/Flyout";
import { FlyoutObjectDetection } from "./Controls/FlyoutObjectDetection";
import { imageListStyles } from "./Controls/ImageList.styles";
import { TabsView } from "./Controls/TabsView";
import { IVisionExplanationDashboardProps } from "./Interfaces/IVisionExplanationDashboardProps";
import { IVisionExplanationDashboardState } from "./Interfaces/IVisionExplanationDashboardState";
import { visionExplanationDashboardStyles } from "./VisionExplanationDashboard.styles";
import { VisionExplanationDashboardCommon } from "./VisionExplanationDashboardCommon";
import {
  preprocessData,
  getItems,
  defaultState,
  VisionDatasetExplorerTabOptions,
  defaultImageSizes,
  getCohort
} from "./VisionExplanationDashboardHelper";
export class VisionExplanationDashboard extends React.Component<
  IVisionExplanationDashboardProps,
  IVisionExplanationDashboardState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private originalErrorInstances: IVisionListItem[] = [];
  private originalSuccessInstances: IVisionListItem[] = [];
  public constructor(props: IVisionExplanationDashboardProps) {
    super(props);
    this.state = defaultState;
  }
  public componentDidMount(): void {
    const data = preprocessData(this.props, this.context.dataset);
    if (!data) {
      return;
    }
    this.originalErrorInstances = data.errorInstances;
    this.originalSuccessInstances = data.successInstances;
    this.setState(data);
  }
  public componentDidUpdate(prevProps: IVisionExplanationDashboardProps): void {
    if (this.props.selectedCohort !== prevProps.selectedCohort) {
      this.setState(
        getItems(
          this.props,
          this.originalErrorInstances,
          this.originalSuccessInstances
        )
      );
    }
  }
  public render(): React.ReactNode {
    const classNames = visionExplanationDashboardStyles();
    const imageStyles = imageListStyles();
    return this.context.dataset.task_type === "object_detection" ? (
      <Stack
        horizontal={false}
        grow
        id="visionDataAnalysisPivot"
        tokens={{ childrenGap: "l1", padding: "m 40px" }}
      >
        <Stack.Item>
          <VisionExplanationDashboardCommon
            thisdashboard={this}
            imageStyles={imageStyles}
            classNames={classNames}
          />
        </Stack.Item>
        <Stack.Item>
          <TabsView
            addCohort={this.addCohortWrapper}
            errorInstances={this.state.errorInstances}
            successInstances={this.state.successInstances}
            imageDim={this.state.imageDim}
            numRows={this.state.numRows}
            otherMetadataFieldNames={this.state.otherMetadataFieldNames}
            pageSize={this.state.pageSize}
            searchValue={this.state.searchValue}
            selectedItem={this.state.selectedItem}
            selectedKey={this.state.selectedKey}
            onItemSelect={this.onItemSelect}
            updateSelectedIndices={this.updateSelectedIndices}
            selectedCohort={this.props.selectedCohort}
            setSelectedCohort={this.props.setSelectedCohort}
          />
        </Stack.Item>
        <Stack.Item>
          {this.state.panelOpen && (
            <FlyoutObjectDetection
              dataset={this.context.dataset}
              explanations={this.state.computedExplanations}
              isOpen={this.state.panelOpen}
              item={this.state.selectedItem}
              loadingExplanation={this.state.loadingExplanation}
              otherMetadataFieldNames={this.state.otherMetadataFieldNames}
              callback={this.onPanelClose}
              onChange={this.onItemSelectObjectDetection}
            />
          )}
        </Stack.Item>
      </Stack>
    ) : (
      <Stack
        horizontal={false}
        grow
        tokens={{ childrenGap: "l1", padding: "m 40px" }}
      >
        <VisionExplanationDashboardCommon
          thisdashboard={this}
          imageStyles={imageStyles}
          classNames={classNames}
        />
        <Stack.Item>
          <TabsView
            addCohort={this.addCohortWrapper}
            errorInstances={this.state.errorInstances}
            successInstances={this.state.successInstances}
            imageDim={this.state.imageDim}
            numRows={this.state.numRows}
            otherMetadataFieldNames={this.state.otherMetadataFieldNames}
            pageSize={this.state.pageSize}
            searchValue={this.state.searchValue}
            selectedItem={this.state.selectedItem}
            selectedKey={this.state.selectedKey}
            onItemSelect={this.onItemSelect}
            updateSelectedIndices={this.updateSelectedIndices}
            selectedCohort={this.props.selectedCohort}
            setSelectedCohort={this.props.setSelectedCohort}
          />
        </Stack.Item>
        <Stack.Item>
          <Flyout
            explanations={this.state.computedExplanations}
            isOpen={this.state.panelOpen}
            item={this.state.selectedItem}
            loadingExplanation={this.state.loadingExplanation}
            otherMetadataFieldNames={this.state.otherMetadataFieldNames}
            callback={this.onPanelClose}
          />
        </Stack.Item>
      </Stack>
    );
  }
  public updateSelectedIndices = (indices: number[]): void => {
    this.setState({ selectedIndices: indices });
  };
  public addCohortWrapper = (name: string, switchCohort: boolean): void => {
    this.context.addCohort(
      getCohort(name, this.state.selectedIndices, this.context.jointDataset),
      undefined,
      switchCohort
    );
  };
  public onPanelClose = (): void => {
    this.setState({ panelOpen: !this.state.panelOpen });
  };
  public onSearch = (
    _event?: React.ChangeEvent<HTMLInputElement>,
    newValue?: string
  ): void => {
    this.setState({ searchValue: newValue || "" });
  };
  public onItemSelect = (item: IVisionListItem): void => {
    this.setState({ panelOpen: !this.state.panelOpen, selectedItem: item });
    const index = item.index;
    const { computedExplanations, loadingExplanation } = this.state;
    const computedExplanation = computedExplanations.get(0)?.get(index);
    if (computedExplanation) {
      loadingExplanation[0][index] = false;
      this.setState({
        loadingExplanation
      });
      return;
    }
    if (this.props.requestExp) {
      loadingExplanation[0][index] = true;
      this.setState({ loadingExplanation });
      this.props
        .requestExp(index, new AbortController().signal)
        .then((result) => {
          const explanation = result.toString();
          computedExplanations.get(0)?.set(index, explanation);
          loadingExplanation[0][index] = false;
          this.setState({
            computedExplanations,
            loadingExplanation
          });
        });
    }
  };
  public onItemSelectObjectDetection = (
    item: IVisionListItem,
    selectedObject = -1
  ): void => {
    this.setState({ panelOpen: true, selectedItem: item });
    const { computedExplanations, loadingExplanation } = this.state;
    if (selectedObject !== -1) {
      if (computedExplanations.get(item.index)?.get(selectedObject)) {
        loadingExplanation[item.index][selectedObject] = false;
        this.setState({
          loadingExplanation
        });
        return;
      }
    }
    if (this.props.requestExp && selectedObject !== -1) {
      loadingExplanation[item.index][selectedObject] = true;
      this.setState({ loadingExplanation });
      this.props
        .requestExp([item.index, selectedObject], new AbortController().signal)
        .then((result) => {
          computedExplanations
            .get(item.index)
            ?.set(selectedObject, result.toString());
          computedExplanations.set(
            item.index,
            computedExplanations.get(item.index) ??
              new Map().set(selectedObject, result.toString())
          );
          loadingExplanation[item.index][selectedObject] = false;
          this.setState({
            computedExplanations,
            loadingExplanation
          });
        });
    }
  };
  /* For onSliderChange, the max imageDims per tab (400 and 100) are selected arbitrary to look like the Figma. 
  For handleLinkClick, the default are half the max values chosen in onSliderChange. */
  public onSliderChange = (value: number): void => {
    if (
      this.state.selectedKey ===
      VisionDatasetExplorerTabOptions.ImageExplorerView
    ) {
      this.setState({ imageDim: Math.floor((value / 100) * 400) });
    } else {
      this.setState({ imageDim: Math.floor((value / 100) * 100) });
    }
  };
  public onNumRowsSelect = (
    _event: React.FormEvent<HTMLDivElement>,
    item: IDropdownOption | undefined
  ): void => {
    this.setState({ numRows: Number(item?.text) });
  };
  public onPageSizeSelect = (
    _event: React.FormEvent<HTMLDivElement>,
    item: IDropdownOption | undefined
  ): void => {
    this.setState({ pageSize: Number(item?.text) });
  };
  public handleLinkClick = (item?: PivotItem): void => {
    if (item && item.props.itemKey !== undefined) {
      this.setState({ selectedKey: item.props.itemKey });
      switch (item.props.itemKey) {
        case VisionDatasetExplorerTabOptions.ImageExplorerView:
          this.setState({ imageDim: defaultImageSizes.imageExplorerView });
          break;
        case VisionDatasetExplorerTabOptions.TableView:
          this.setState({ imageDim: defaultImageSizes.tableView });
          break;
        default:
          this.setState({ imageDim: defaultImageSizes.dataCharacteristics });
          break;
      }
    }
  };
}
