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
  TooltipHost
} from "office-ui-fabric-react";
import React from "react";

import { PredictionTabKeys } from "../ModelAssessmentEnums";
import { IGlobalSeries, LocalImportancePlots } from "@responsible-ai/interpret";
import { selection } from "d3-selection";
import { valuesIn } from "lodash";

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
  selection: Selection;
  selectedIndexes: number[];
}

export class IndividualFeatureImportanceView extends React.Component<
  IIndividualFeatureImportanceProps,
  IIndividualFeatureImportanceState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  private dropdownItems: IDropdownOption[] = [];

  public constructor(props: IIndividualFeatureImportanceProps) {
    super(props);
    this.state = {
      activePredictionTab: PredictionTabKeys.AllSelectedTab,
      featureImportances: [],
      sortArray: [],
      tableState: this.updateItems(),
      selection: new Selection({
        onSelectionChanged: (): void => {
          this.updateSelectedIndexes();
          this.updateViewedFeatureImportances();
        }
      }),
      selectedIndexes: []
    };

    this.updateSelection();

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
      this.setState({ selectedIndexes: [] });
    }
    if (
      this.props.selectedCohort !== prevProps.selectedCohort ||
      this.state.activePredictionTab != prevState.activePredictionTab
    ) {
      this.setState({ tableState: this.updateItems() });
      this.updateSelection();
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
                <MarqueeSelection selection={this.state.selection}>
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
                    selection={this.state.selection}
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

  private updateViewedFeatureImportances(): void {
    const inspectedFeatureImportance = this.state.selection
      .getSelectedIndices()
      .map(
        (rowIndex, colorIndex): IGlobalSeries => {
          const row = this.props.jointDataset.getRow(rowIndex);
          return {
            colorIndex,
            id: rowIndex,
            name: localization.formatString(
              localization.Interpret.WhatIfTab.rowLabel,
              rowIndex.toString()
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
    const includedIndexes = this.state.selection.getSelectedIndices();
    const featureImportances = inspectedFeatureImportance.filter((row) => {
      if (row.id !== undefined) {
        return includedIndexes.includes(row.id);
      }
      return false;
    });
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
    this.setState({
      featureImportances,
      sortArray,
      sortingSeriesIndex
    });
  }

  private updateSelection(): void {
    this.updateSelectedIndexes();
    this.state.selection.setItems(
      this.state.tableState.rows.map((row) => {
        return { key: row[0], value: row };
      })
    );

    this.state.selection.getItems().forEach((row) => {
      if (row.key === undefined) {
        return;
      }
      if (this.state.selectedIndexes.includes(row.key as number)) {
        this.state.selection.setKeySelected(row.key as string, true, true);
      } else {
        this.state.selection.setKeySelected(row.key as string, false, false);
      }
    });
  }

  private updateItems(): ITableState {
    let rows = [];

    this.props.selectedCohort.cohort.sort();
    const cohortData = this.props.selectedCohort.cohort.filteredData;
    const numRows: number = cohortData.length;
    let viewedRows: number = numRows;
    let indexes: number[] | undefined;

    switch (this.state?.activePredictionTab) {
      case PredictionTabKeys.CorrectPredictionTab:
        indexes = this.getCorrectIndexes();
        break;
      case PredictionTabKeys.IncorrectPredictionTab:
        indexes = this.getIncorrectIndexes();
        break;
      case PredictionTabKeys.AllSelectedTab:
        indexes = this.getAllIndexes();
        break;
    }
    if (indexes) {
      viewedRows = Math.min(viewedRows, indexes.length);
    }

    rows = constructRows(
      cohortData,
      this.props.jointDataset,
      viewedRows,
      this.tabularDataFilter.bind(this),
      indexes
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

  private getIncorrectIndexes() {
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

  private getCorrectIndexes() {
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

  private getAllIndexes() {
    return this.props.selectedCohort.cohort.filteredData.map(
      (row: { [key: string]: number }) => {
        return row[JointDataset.IndexLabel] as number;
      }
    );
  }

  private updateSelectedIndexes() {
    // Merge currently visible selection with overall selection
    // which may include currently hidden items.
    const currentlySelectedIndices = this.state.selection
      .getSelection()
      .map((row) => {
        return row[0] as number;
      });
    this.setState({
      selectedIndexes: [
        ...this.state.selectedIndexes,
        ...currentlySelectedIndices.filter((value) => {
          return !this.state.selectedIndexes.includes(value);
        })
      ]
    });
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
