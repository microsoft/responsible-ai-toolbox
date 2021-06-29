// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  WeightVectorOption,
  ErrorCohort,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  JointDataset,
  ModelExplanationUtils,
  FabricStyles,
  constructRows,
  ITableState,
  constructCols
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  ConstrainMode,
  DetailsList,
  DetailsListLayoutMode,
  Dropdown,
  Fabric,
  IDetailsColumnRenderTooltipProps,
  IDetailsHeaderProps,
  IDropdownOption,
  IRenderFunction,
  MarqueeSelection,
  ScrollablePane,
  ScrollbarVisibility,
  Selection,
  SelectAllVisibility,
  SelectionMode,
  Stack,
  TooltipHost,
  IObjectWithKey
} from "office-ui-fabric-react";
import React from "react";

import { PredictionTabKeys } from "../ModelAssessmentEnums";
import { IGlobalSeries, LocalImportancePlots } from "@responsible-ai/interpret";

export interface IIndividualFeatureImportanceProps {
  features: string[];
  jointDataset: JointDataset;
  invokeModel?: (data: any[], abortSignal: AbortSignal) => Promise<any[]>;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
  onWeightChange: (option: WeightVectorOption) => void;
  selectedCohort: ErrorCohort;
}

export interface IIndividualFeatureImportanceState {
  activePredictionTab: PredictionTabKeys;
  featureImportances: IGlobalSeries[];
  sortArray: number[];
  sortingSeriesIndex?: number;
  tableState: ITableState;
  selectedCorrectItems: IObjectWithKey[];
  selectedIncorrectItems: IObjectWithKey[];
}

export class IndividualFeatureImportanceView extends React.Component<
  IIndividualFeatureImportanceProps,
  IIndividualFeatureImportanceState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  private selection: Selection = new Selection({
    onSelectionChanged: (): void => {
      // if (!(this.selection as any)._hasChanged) {
      //   return;
      // }
      let newState: IIndividualFeatureImportanceState = this.state;
      newState = {
        ...newState,
        ...this.updateSelectedItems(this.state.activePredictionTab)
      };
      const allSelectedItems = [
        ...newState.selectedCorrectItems,
        ...newState.selectedIncorrectItems
      ].sort();

      this.setState({
        ...newState,
        ...this.updateViewedFeatureImportances(allSelectedItems)
      });
    }
  });
  private dropdownItems: IDropdownOption[] = [];

  public constructor(props: IIndividualFeatureImportanceProps) {
    super(props);

    this.update();

    this.dropdownItems.push({
      key: PredictionTabKeys.CorrectPredictionTab,
      text: localization.ErrorAnalysis.correctPrediction
    });
    this.dropdownItems.push({
      key: PredictionTabKeys.IncorrectPredictionTab,
      text: localization.ErrorAnalysis.incorrectPrediction
    });
    this.dropdownItems.push({
      key: PredictionTabKeys.AllSelectedTab,
      text: localization.ErrorAnalysis.allSelected
    });
  }

  public componentDidUpdate(
    prevProps: IIndividualFeatureImportanceProps,
    prevState: IIndividualFeatureImportanceState
  ): void {
    if (this.props.selectedCohort !== prevProps.selectedCohort) {
      this.setState({ selectedCorrectItems: [], selectedIncorrectItems: [] });
    }
    if (
      this.props.selectedCohort !== prevProps.selectedCohort ||
      this.state.activePredictionTab != prevState.activePredictionTab
    ) {
      this.update();
    }
  }

  public render(): React.ReactNode {
    if (this.state.tableState === undefined) {
      return React.Fragment;
    }
    const testableDatapoints = this.state.featureImportances.map(
      (item) => item.unsortedFeatureValues as any[]
    );
    const testableDatapointColors = this.state.featureImportances.map(
      (item) => FabricStyles.fabricColorPalette[item.colorIndex]
    );
    const testableDatapointNames = this.state.featureImportances.map(
      (item) => item.name
    );

    const featuresOption: IDropdownOption[] = new Array(
      this.context.jointDataset.datasetFeatureCount
    )
      .fill(0)
      .map((_, index) => {
        const key = JointDataset.DataLabelRoot + index.toString();
        const meta = this.context.jointDataset.metaDict[key];
        const options = meta.isCategorical
          ? meta.sortedCategoricalValues?.map((optionText, index) => {
              return { key: index, text: optionText };
            })
          : undefined;
        return {
          data: {
            categoricalOptions: options,
            fullLabel: meta.label.toLowerCase()
          },
          key,
          text: meta.abbridgedLabel
        };
      });

    return (
      <Stack tokens={{ padding: "15px 38px 0 38px", childrenGap: "10px" }}>
        <Dropdown
          selectedKey={this.state.activePredictionTab}
          options={this.dropdownItems}
          onChange={this.onDropdownSelectionChange.bind(this)}
          styles={{ dropdown: { width: 180 } }}
        />
        <div className="tabularDataView">
          <div style={{ height: "800px", position: "relative" }}>
            <Fabric>
              <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
                <MarqueeSelection selection={this.selection}>
                  <DetailsList
                    items={this.state.tableState.rows}
                    columns={this.state.tableState.columns}
                    setKey="set"
                    layoutMode={DetailsListLayoutMode.fixedColumns}
                    constrainMode={ConstrainMode.unconstrained}
                    onRenderDetailsHeader={onRenderDetailsHeader}
                    selectionPreservedOnEmptyClick
                    ariaLabelForSelectionColumn="Toggle selection"
                    ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                    checkButtonAriaLabel="Row checkbox"
                    selectionMode={SelectionMode.multiple}
                    selection={this.selection}
                  />
                </MarqueeSelection>
              </ScrollablePane>
            </Fabric>
          </div>
        </div>
        <LocalImportancePlots
          includedFeatureImportance={this.state.featureImportances}
          jointDataset={this.context.jointDataset}
          metadata={this.context.modelMetadata}
          selectedWeightVector={this.props.selectedWeightVector}
          weightOptions={this.props.weightOptions}
          weightLabels={this.props.weightLabels}
          testableDatapoints={testableDatapoints}
          testableDatapointColors={testableDatapointColors}
          testableDatapointNames={testableDatapointNames}
          featuresOption={featuresOption}
          sortArray={this.state.sortArray}
          sortingSeriesIndex={this.state.sortingSeriesIndex}
          invokeModel={this.props.invokeModel}
          onWeightChange={this.props.onWeightChange}
        />
      </Stack>
    );
  }

  private onDropdownSelectionChange(
    _?: React.FormEvent<HTMLElement | HTMLInputElement>,
    option?: IDropdownOption
  ): void {
    if (option) {
      this.setState({
        activePredictionTab: PredictionTabKeys[option.key]
      });
    }
  }

  private updateViewedFeatureImportances(
    allSelectedItems: IObjectWithKey[]
  ): Partial<IIndividualFeatureImportanceState> {
    const featureImportances = allSelectedItems.map(
      (row, colorIndex): IGlobalSeries => {
        return {
          colorIndex,
          id: row[JointDataset.IndexLabel],
          name: localization.formatString(
            localization.Interpret.WhatIfTab.rowLabel,
            row[JointDataset.IndexLabel].toString()
          ),
          unsortedAggregateY: JointDataset.localExplanationSlice(
            row,
            this.props.jointDataset.localExplanationFeatureCount
          ) as number[],
          unsortedFeatureValues: JointDataset.datasetSlice(
            row,
            this.props.jointDataset.metaDict,
            this.props.jointDataset.datasetFeatureCount
          )
        };
      }
    );
    let sortArray: number[] = [];
    let sortingSeriesIndex: number | undefined;
    if (featureImportances.length !== 0) {
      sortingSeriesIndex = 0;
      sortArray = ModelExplanationUtils.getSortIndices(
        featureImportances[0].unsortedAggregateY
      ).reverse();
    } else {
      sortingSeriesIndex = undefined;
    }
    return {
      featureImportances,
      sortArray,
      sortingSeriesIndex
    };
  }

  private updateSelection(
    allSelectedItems: IObjectWithKey[],
    tableState: ITableState
  ): void {
    // first unselect all items
    //this.selection.setChangeEvents(false);
    //this.selection.setItems(tableState.rows, true);
    //this.selection.setChangeEvents(true);

    // this.selection.getSelectedIndices().forEach((index) => {
    //   this.selection.setIndexSelected(index, false, false);
    // });

    // this.selection = new Selection({
    //   onSelectionChanged: (): void => {
    //     let newState: IIndividualFeatureImportanceState = this.state;
    //     newState = {
    //       ...newState,
    //       ...this.updateSelectedItems(this.state.activePredictionTab)
    //     };
    //     const allSelectedItems = [
    //       ...newState.selectedCorrectItems,
    //       ...newState.selectedIncorrectItems
    //     ].sort();

    //     this.setState({
    //       ...newState,
    //       ...this.updateViewedFeatureImportances(allSelectedItems)
    //     });
    //   },
    //   items: tableState.rows
    // });

    // // then select the ones that should be selected
    // allSelectedItems.forEach((row) => {
    //   const index = tableState.rows
    //     .map((row) => row[0])
    //     .indexOf(row[JointDataset.IndexLabel]);
    //   if (index === -1) {
    //     return;
    //   }
    //   this.selection.setIndexSelected(index, true, true);
    // });
    return;
  }

  private updateItems(): ITableState {
    let rows = [];

    this.props.selectedCohort.cohort.sort();
    const cohortData = this.props.selectedCohort.cohort.filteredData;
    const numRows: number = cohortData.length;
    let viewedRows: number = numRows;
    let indices: number[] | undefined;

    switch (this.state?.activePredictionTab) {
      case PredictionTabKeys.CorrectPredictionTab:
        indices = this.getCorrectIndices();
        break;
      case PredictionTabKeys.IncorrectPredictionTab:
        indices = this.getIncorrectIndices();
        break;
      case PredictionTabKeys.AllSelectedTab:
        indices = this.getAllIndices();
        break;
    }
    if (indices) {
      viewedRows = Math.min(viewedRows, indices.length);
    }

    rows = constructRows(
      cohortData,
      this.props.jointDataset,
      viewedRows,
      this.tabularDataFilter.bind(this),
      indices
    );

    const numCols: number = this.props.jointDataset.datasetFeatureCount;
    const featureNames: string[] = this.props.features;
    const viewedCols: number = Math.min(numCols, featureNames.length);
    const columns = constructCols(
      viewedCols,
      featureNames,
      this.props.jointDataset,
      false
    );
    return {
      columns,
      rows
    };
  }

  private tabularDataFilter(row: { [key: string]: number }): boolean {
    let activePredictionTab = this.state
      ? this.state.activePredictionTab
      : PredictionTabKeys.AllSelectedTab;
    switch (activePredictionTab) {
      case PredictionTabKeys.CorrectPredictionTab: {
        if (
          row[JointDataset.PredictedYLabel] !== row[JointDataset.TrueYLabel]
        ) {
          return true;
        }
        break;
      }
      case PredictionTabKeys.IncorrectPredictionTab: {
        if (
          row[JointDataset.PredictedYLabel] === row[JointDataset.TrueYLabel]
        ) {
          return true;
        }
        break;
      }
      case PredictionTabKeys.AllSelectedTab:
      default:
        break;
    }
    return false;
  }

  private getIncorrectIndices() {
    return this.props.selectedCohort.cohort.filteredData
      .filter((row: { [key: string]: number }) => {
        return (
          row[JointDataset.PredictedYLabel] !== row[JointDataset.TrueYLabel]
        );
      })
      .map((row: { [key: string]: number }) => {
        return row[JointDataset.IndexLabel] as number;
      });
  }

  private getCorrectIndices() {
    return this.props.selectedCohort.cohort.filteredData
      .filter((row: { [key: string]: number }) => {
        return (
          row[JointDataset.PredictedYLabel] === row[JointDataset.TrueYLabel]
        );
      })
      .map((row: { [key: string]: number }) => {
        return row[JointDataset.IndexLabel] as number;
      });
  }

  private getAllIndices() {
    return this.props.selectedCohort.cohort.filteredData.map(
      (row: { [key: string]: number }) => {
        return row[JointDataset.IndexLabel] as number;
      }
    );
  }

  private updateSelectedItems(
    activePredictionTab: PredictionTabKeys
  ): Partial<IIndividualFeatureImportanceState> {
    // Merge currently visible selection with overall selection
    // which may include currently hidden items.
    const currentSelectionItems = this.selection.getSelection().map((row) => {
      return this.props.jointDataset.getRow(row[0]);
    });
    const currentlySelectedCorrectItems = currentSelectionItems.filter(
      (row) =>
        row[JointDataset.PredictedYLabel] === row[JointDataset.TrueYLabel]
    );
    const currentlySelectedIncorrectItems = currentSelectionItems.filter(
      (row) =>
        row[JointDataset.PredictedYLabel] !== row[JointDataset.TrueYLabel]
    );

    // Only update the indices if they are currently visible.
    // The indices that are currently hidden can't be updated.
    switch (activePredictionTab) {
      case PredictionTabKeys.AllSelectedTab:
        return {
          selectedCorrectItems: currentlySelectedCorrectItems,
          selectedIncorrectItems: currentlySelectedIncorrectItems
        };
      case PredictionTabKeys.CorrectPredictionTab:
        return {
          selectedCorrectItems: currentlySelectedCorrectItems
        };
      case PredictionTabKeys.IncorrectPredictionTab:
        return {
          selectedIncorrectItems: currentlySelectedIncorrectItems
        };
    }
  }

  private update() {
    let newState: IIndividualFeatureImportanceState = this.state;
    if (newState === undefined) {
      newState = {
        activePredictionTab: PredictionTabKeys.AllSelectedTab,
        featureImportances: [],
        sortArray: [],
        tableState: {} as ITableState,
        selectedCorrectItems: [],
        selectedIncorrectItems: []
      };
    }
    newState.tableState = this.updateItems();

    newState = {
      ...newState,
      ...this.updateSelectedItems(newState.activePredictionTab)
    };

    const allSelectedItems = [
      ...newState.selectedCorrectItems,
      ...newState.selectedIncorrectItems
    ].sort();

    this.updateSelection(allSelectedItems, newState.tableState);

    newState = {
      ...newState,
      ...this.updateViewedFeatureImportances(allSelectedItems)
    };
    if (this.state === undefined) {
      this.state = newState;
    } else {
      this.setState(newState);
    }
  }
}

const onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps> = (
  props,
  defaultRender
) => {
  if (!props) {
    return <div />;
  }
  const onRenderColumnHeaderTooltip: IRenderFunction<IDetailsColumnRenderTooltipProps> = (
    tooltipHostProps
  ) => <TooltipHost {...tooltipHostProps} />;
  return (
    <div>
      {defaultRender?.({
        ...props,
        onRenderColumnHeaderTooltip,
        selectAllVisibility: SelectAllVisibility.hidden
      })}
    </div>
  );
};
