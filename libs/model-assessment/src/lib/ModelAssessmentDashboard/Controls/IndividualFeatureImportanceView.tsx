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

export interface ISelectionDetails {
  selectedDatasetIndexes: number[];
  selectedCorrectDatasetIndexes: number[];
  selectedIncorrectDatasetIndexes: number[];
  selectedAllSelectedIndexes: number[];
  selectedIndexes: number[];

  isEqual(other: ISelectionDetails): boolean;
}

class SelectionDetails implements ISelectionDetails {
  selectedDatasetIndexes: number[];
  selectedCorrectDatasetIndexes: number[];
  selectedIncorrectDatasetIndexes: number[];
  selectedAllSelectedIndexes: number[];
  selectedIndexes: number[];

  constructor(
    d: number[],
    cd: number[],
    id: number[],
    as: number[],
    activePredictionTab: PredictionTabKeys
  ) {
    this.selectedDatasetIndexes = d;
    this.selectedCorrectDatasetIndexes = cd;
    this.selectedIncorrectDatasetIndexes = id;
    this.selectedAllSelectedIndexes = as;

    switch (activePredictionTab) {
      case PredictionTabKeys.CorrectPredictionTab: {
        this.selectedIndexes = this.selectedCorrectDatasetIndexes;
      }
      case PredictionTabKeys.IncorrectPredictionTab: {
        this.selectedIndexes = this.selectedIncorrectDatasetIndexes;
      }
      default:
        // show all
        this.selectedIndexes = this.selectedAllSelectedIndexes;
    }
  }

  isEqual(other: ISelectionDetails): boolean {
    return (
      this.selectedDatasetIndexes.toString() ===
        other.selectedDatasetIndexes.toString() &&
      this.selectedCorrectDatasetIndexes.toString() ===
        other.selectedCorrectDatasetIndexes.toString() &&
      this.selectedIncorrectDatasetIndexes.toString() ===
        other.selectedIncorrectDatasetIndexes.toString() &&
      this.selectedAllSelectedIndexes.toString() ===
        other.selectedAllSelectedIndexes.toString() &&
      this.selectedIndexes.toString() === other.selectedIndexes.toString()
    );
  }
}

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
  selectionDetails: ISelectionDetails;
  activePredictionTab: PredictionTabKeys;
  featureImportances: IGlobalSeries[];
  sortArray: number[];
  sortingSeriesIndex?: number;
  tableState: ITableState;
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
  private _selection: Selection;

  public constructor(props: IIndividualFeatureImportanceProps) {
    super(props);
    this.state = {
      selectionDetails: new SelectionDetails(
        [],
        [],
        [],
        [],
        PredictionTabKeys.AllSelectedTab
      ),
      activePredictionTab: PredictionTabKeys.AllSelectedTab,
      featureImportances: [],
      sortArray: [],
      tableState: this.updateItems()
    };

    this._selection = new Selection({
      onSelectionChanged: (): void => {
        this.setSelectedIndexes(
          this._selection.getSelection().map((row) => row[0] as number)
        );
      }
    });
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
    if (
      this.props.selectedCohort !== prevProps.selectedCohort ||
      !this.state.selectionDetails.isEqual(prevState.selectionDetails)
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
                <MarqueeSelection selection={this._selection}>
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
                    selection={this._selection}
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
      let selectedCorrectIndexes = this.state.selectionDetails
        .selectedCorrectDatasetIndexes;
      let selectedIncorrectIndexes = this.state.selectionDetails
        .selectedIncorrectDatasetIndexes;
      // If going from AllSelectedTab, need to update the other arrays
      if (this.state.activePredictionTab === PredictionTabKeys.AllSelectedTab) {
        selectedCorrectIndexes = selectedCorrectIndexes.filter((index) =>
          this.state.selectionDetails.selectedAllSelectedIndexes.includes(index)
        );
        selectedIncorrectIndexes = selectedIncorrectIndexes.filter((index) =>
          this.state.selectionDetails.selectedAllSelectedIndexes.includes(index)
        );
      }
      const selectedIndexes = [
        ...selectedCorrectIndexes,
        ...selectedIncorrectIndexes
      ];
      this.setState({
        selectionDetails: new SelectionDetails(
          selectedIndexes,
          selectedCorrectIndexes,
          selectedIncorrectIndexes,
          this.state.selectionDetails.selectedAllSelectedIndexes,
          PredictionTabKeys[option.key]
        ),
        activePredictionTab: PredictionTabKeys[option.key]
      });
    }
  }

  private setSelectedIndexes(indexes: number[]) {
    let selectedIndexes: number[];
    switch (this.state.activePredictionTab) {
      case PredictionTabKeys.CorrectPredictionTab:
        selectedIndexes = [
          ...indexes,
          ...this.state.selectionDetails.selectedIncorrectDatasetIndexes
        ];
        this.setState(
          this.updateViewedFeatureImportances(
            new SelectionDetails(
              selectedIndexes,
              indexes,
              this.state.selectionDetails.selectedIncorrectDatasetIndexes,
              selectedIndexes,
              PredictionTabKeys.CorrectPredictionTab
            ),
            PredictionTabKeys.CorrectPredictionTab
          )
        );
        break;
      case PredictionTabKeys.IncorrectPredictionTab:
        selectedIndexes = [
          ...this.state.selectionDetails.selectedCorrectDatasetIndexes,
          ...indexes
        ];
        this.setState(
          this.updateViewedFeatureImportances(
            new SelectionDetails(
              selectedIndexes,
              this.state.selectionDetails.selectedCorrectDatasetIndexes,
              indexes,
              selectedIndexes,
              PredictionTabKeys.IncorrectPredictionTab
            ),
            PredictionTabKeys.IncorrectPredictionTab
          )
        );
        break;
      default:
        // show all
        this.setState(
          this.updateViewedFeatureImportances(
            new SelectionDetails(
              this.state.selectionDetails.selectedDatasetIndexes,
              this.state.selectionDetails.selectedCorrectDatasetIndexes,
              this.state.selectionDetails.selectedIncorrectDatasetIndexes,
              indexes,
              PredictionTabKeys.AllSelectedTab
            ),
            PredictionTabKeys.AllSelectedTab
          )
        );
        break;
    }
  }

  private updateViewedFeatureImportances(
    selectionDetails: ISelectionDetails,
    activePredictionTab: PredictionTabKeys
  ): IIndividualFeatureImportanceState {
    const includedIndexes = selectionDetails.selectedAllSelectedIndexes;
    const inspectedFeatureImportance = selectionDetails.selectedAllSelectedIndexes.map(
      (rowIndex, colorIndex): IGlobalSeries => {
        const row = this.context.jointDataset.getRow(rowIndex);
        return {
          colorIndex,
          id: rowIndex,
          name: localization.formatString(
            localization.Interpret.WhatIfTab.rowLabel,
            rowIndex.toString()
          ),
          unsortedAggregateY: JointDataset.localExplanationSlice(
            row,
            this.context.jointDataset.localExplanationFeatureCount
          ) as number[],
          unsortedFeatureValues: JointDataset.datasetSlice(
            row,
            this.context.jointDataset.metaDict,
            this.context.jointDataset.datasetFeatureCount
          )
        };
      }
    );
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
    return {
      featureImportances,
      sortArray,
      sortingSeriesIndex,
      selectionDetails,
      activePredictionTab,
      tableState: this.state.tableState
    };
  }

  private updateSelection(): void {
    this._selection.setItems(this.state.tableState.rows);
    const rowIndexes = this.state.tableState.rows.map((row) => row[0]);
    this.state.selectionDetails.selectedIndexes.forEach(
      (selectedIndex): void => {
        const rowIndex = rowIndexes.indexOf(selectedIndex);
        this._selection.setIndexSelected(rowIndex, true, true);
      }
    );
  }

  private updateItems(): ITableState {
    let rows = [];

    this.props.selectedCohort.cohort.sort();
    const cohortData = this.props.selectedCohort.cohort.filteredData;
    const numRows: number = cohortData.length;
    let viewedRows: number = Math.min(
      numRows,
      this.state
        ? this.state.selectionDetails.selectedAllSelectedIndexes.length
        : numRows
    );

    rows = constructRows(
      cohortData,
      this.props.jointDataset,
      viewedRows,
      this.tabularDataFilter.bind(this),
      this.state?.selectionDetails.selectedAllSelectedIndexes
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
