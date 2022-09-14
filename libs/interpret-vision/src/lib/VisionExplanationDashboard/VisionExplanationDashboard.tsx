// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IDropdownOption,
  Stack,
  PivotItem,
  Slider,
  Separator,
  Text,
  mergeStyles
} from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  IVisionListItem,
  ModelAssessmentContext,
  Cohort,
  IFilter,
  FilterMethods,
  ICompositeFilter,
  Operations,
  JointDataset
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { CohortToolBar } from "./Controls/CohortToolBar";
import { Flyout } from "./Controls/Flyout";
import { imageListStyles } from "./Controls/ImageList.styles";
import { PageSizeSelectors } from "./Controls/PageSizeSelectors";
import { Pivots } from "./Controls/Pivots";
import { TabsView } from "./Controls/TabsView";
import { ToolBar } from "./Controls/ToolBar";
import { IVisionExplanationDashboardProps } from "./Interfaces/IVisionExplanationDashboardProps";
import { IVisionExplanationDashboardState } from "./Interfaces/IVisionExplanationDashboardState";
import { visionExplanationDashboardStyles } from "./VisionExplanationDashboard.styles";

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
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  originalErrorInstances: IVisionListItem[];
  originalSuccessInstances: IVisionListItem[];
  public constructor(props: IVisionExplanationDashboardProps) {
    super(props);
    this.originalErrorInstances = [];
    this.originalSuccessInstances = [];
    this.state = {
      computedExplanations: new Map(),
      errorInstances: [],
      imageDim: 200,
      loadingExplanation: [],
      numRows: 3,
      otherMetadataFieldNames: ["mean_pixel_value"],
      pageSize: 10,
      panelOpen: false,
      searchValue: "",
      selectedIndices: [],
      selectedItem: undefined,
      selectedKey: VisionDatasetExplorerTabOptions.ImageExplorerView,
      successInstances: []
    };
  }

  public componentDidMount(): void {
    this.preprocessData();
  }

  public componentDidUpdate(prevProps: IVisionExplanationDashboardProps): void {
    if (this.props.selectedCohort !== prevProps.selectedCohort) {
      this.updateItems();
    }
  }

  public render(): React.ReactNode {
    const classNames = visionExplanationDashboardStyles();
    const imageStyles = imageListStyles();
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
            cohorts={this.props.cohorts}
            searchValue={this.state.searchValue}
            onSearch={this.onSearch}
            selectedCohort={this.props.selectedCohort}
            setSelectedCohort={this.props.setSelectedCohort}
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
            VisionDatasetExplorerTabOptions.ImageExplorerView ? (
              <Stack.Item>
                <PageSizeSelectors
                  selectedKey={this.state.selectedKey}
                  onNumRowsSelect={this.onNumRowsSelect}
                  onPageSizeSelect={this.onPageSizeSelect}
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
                    imageStyles.errorIndicator,
                    classNames.legendIndicator
                  )}
                >
                  <Text className={imageStyles.labelPredicted}>
                    {localization.InterpretVision.Dashboard.legendFailure}
                  </Text>
                </Stack.Item>
                <Stack.Item
                  className={mergeStyles(
                    imageStyles.successIndicator,
                    classNames.legendIndicator
                  )}
                >
                  <Text className={imageStyles.labelPredicted}>
                    {localization.InterpretVision.Dashboard.legendSuccess}
                  </Text>
                </Stack.Item>
              </Stack>
            )}
          </Stack>
        </Stack.Item>
        {this.state.selectedKey ===
          VisionDatasetExplorerTabOptions.TableView && (
          <Stack.Item>
            <CohortToolBar
              addCohort={this.addCohortWrapper}
              cohorts={this.props.cohorts}
              selectedIndices={this.state.selectedIndices}
            />
          </Stack.Item>
        )}
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

  private preprocessData() {
    const dataSummary = this.props.dataSummary;
    const errorInstances: IVisionListItem[] = this.state.errorInstances;
    const successInstances: IVisionListItem[] = this.state.successInstances;
    const classNames = this.props.dataSummary.class_names;

    const predictedY = dataSummary.predicted_y.map((index) => {
      return classNames[index];
    });

    const trueY = dataSummary.true_y.map((index) => {
      return classNames[index];
    });

    const features: number[] = dataSummary.features!.map((featuresArr) => {
      return featuresArr[0] as number;
    });

    const fieldNames = dataSummary.feature_names!;
    const loadingExplanation: boolean[] = [];
    const computedExplanations: Map<number, string> = new Map();
    dataSummary.images?.forEach((image, index) => {
      const item: IVisionListItem = {
        image,
        index,
        predictedY: predictedY[index],
        trueY: trueY[index]
      };
      fieldNames.forEach((fieldName) => {
        item[fieldName] = features[index];
      });
      item.predictedY === item.trueY
        ? successInstances.push(item)
        : errorInstances.push(item);

      loadingExplanation.push(false);
      computedExplanations.set(index, "");
    });

    this.originalErrorInstances = errorInstances;
    this.originalSuccessInstances = successInstances;

    this.setState({
      computedExplanations,
      errorInstances,
      loadingExplanation,
      otherMetadataFieldNames: fieldNames,
      successInstances
    });
  }

  private updateItems = () => {
    const indices = new Set(
      this.props.selectedCohort.cohort.filteredData.map(
        (row: { [key: string]: number }) => {
          return row[JointDataset.IndexLabel] as number;
        }
      )
    );

    let errorInstances = this.originalErrorInstances;
    let successInstances = this.originalSuccessInstances;

    errorInstances = errorInstances.filter((item: IVisionListItem) =>
      indices.has(item.index)
    );
    successInstances = successInstances.filter((item: IVisionListItem) =>
      indices.has(item.index)
    );
    this.setState({
      errorInstances: [...errorInstances],
      successInstances: [...successInstances]
    });
  };

  private updateSelectedIndices = (indices: number[]) => {
    this.setState({ selectedIndices: indices });
  };

  private addCohortWrapper = (name: string, switchCohort: boolean) => {
    const { selectedIndices } = this.state;
    const filters: IFilter[] = [];

    selectedIndices.forEach((index) => {
      const filter: IFilter = {
        arg: [index],
        column: "Index",
        method: FilterMethods.Equal
      };
      filters.push(filter);
    });

    const compositeFilter: ICompositeFilter = {
      compositeFilters: filters,
      operation: Operations.Or
    };

    const cohort = new Cohort(
      name,
      this.context.jointDataset,
      [],
      [compositeFilter]
    );

    this.context.addCohort(cohort, switchCohort);
  };

  private onPanelClose = () => {
    this.setState({ panelOpen: !this.state.panelOpen });
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
    const { computedExplanations, loadingExplanation } = this.state;
    const computedExplanation = computedExplanations.get(index);
    if (computedExplanation) {
      loadingExplanation[index] = false;
      this.setState({
        loadingExplanation
      });
      return;
    }

    if (this.props.requestExp) {
      loadingExplanation[index] = true;
      this.setState({ loadingExplanation });
      this.props
        .requestExp(index, new AbortController().signal)
        .then((result) => {
          const explanation = result.toString();
          computedExplanations.set(index, explanation);
          loadingExplanation[index] = false;
          this.setState({
            computedExplanations,
            loadingExplanation
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
