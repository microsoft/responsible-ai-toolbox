// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IColumn,
  IDropdownOption,
  ITheme,
  IStackTokens,
  DetailsList,
  DetailsListLayoutMode,
  mergeStyles,
  Selection,
  SelectionMode,
  Fabric,
  Stack,
  Text
} from "@fluentui/react";
import {
  JointDataset,
  WeightVectorOption,
  ModelExplanationUtils,
  IExplanationModelMetadata,
  ErrorCohort,
  FluentUIStyles,
  constructRows,
  constructCols
} from "@responsible-ai/core-ui";
import { LocalImportancePlots, IGlobalSeries } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { HelpMessageDict } from "../../Interfaces/IStringsParam";

export interface IInspectionViewProps {
  theme?: ITheme;
  messages?: HelpMessageDict;
  features: string[];
  jointDataset: JointDataset;
  inspectedIndexes: number[];
  metadata: IExplanationModelMetadata;
  invokeModel?: (data: any[], abortSignal: AbortSignal) => Promise<any[]>;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
  onWeightChange: (option: WeightVectorOption) => void;
  selectedCohort: ErrorCohort;
}

export interface IInspectionViewState {
  sortArray: number[];
  sortingSeriesIndex: number | undefined;
  includedFeatureImportance: IGlobalSeries[];
}

const alignmentStackTokens: IStackTokens = {
  childrenGap: 5,
  padding: 20
};

export class InspectionView extends React.PureComponent<
  IInspectionViewProps,
  IInspectionViewState
> {
  private _rows: any[];
  private _columns: IColumn[];
  private _selection: Selection;
  private _selectionInitialized = false;
  private featuresOption: IDropdownOption[] = new Array(
    this.props.jointDataset.datasetFeatureCount
  )
    .fill(0)
    .map((_, index) => {
      const key = JointDataset.DataLabelRoot + index.toString();
      const meta = this.props.jointDataset.metaDict[key];
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

  public constructor(props: IInspectionViewProps) {
    super(props);
    this.state = {
      includedFeatureImportance: [],
      sortArray: [],
      sortingSeriesIndex: undefined
    };
    this.props.selectedCohort.cohort.sort();
    const cohortData = this.props.selectedCohort.cohort.filteredData;
    const numRows: number = cohortData.length;
    const viewedRows: number = Math.min(
      Math.min(numRows, 8),
      this.props.inspectedIndexes.length
    );
    const colors = this.props.inspectedIndexes.map(
      (_rowIndex, colorIndex) => FluentUIStyles.fluentUIColorPalette[colorIndex]
    );
    this._rows = constructRows(
      cohortData,
      this.props.jointDataset,
      viewedRows,
      undefined,
      this.props.inspectedIndexes,
      colors
    );
    const numCols: number = this.props.jointDataset.datasetFeatureCount;
    const featureNames: string[] = this.props.features;
    // TODO: remove, this is just for debugging for now
    const viewedCols: number = Math.min(numCols, featureNames.length);
    this._columns = constructCols(
      viewedCols,
      featureNames,
      this.props.jointDataset,
      false,
      true
    );
    this._selection = new Selection({
      onSelectionChanged: (): void => {
        if (this._selectionInitialized) {
          const state = this.updateViewedFeatureImportances(
            this.getSelectionDetails()
          );
          this.setState(state);
        }
      }
    });
    this._selection.setItems(this._rows);
    if (this.props.inspectedIndexes) {
      const rowIndexes = this._rows.map((row): number => row[0] as number);
      this.props.inspectedIndexes.forEach((inspectedIndex): void => {
        const rowIndex = rowIndexes.indexOf(inspectedIndex);
        this._selection.setIndexSelected(rowIndex, true, true);
      });
    }
    this._selectionInitialized = true;
    this.state = this.updateViewedFeatureImportances(
      this.getSelectionDetails()
    );
  }

  public componentDidUpdate(prevProps: IInspectionViewProps): void {
    const weightVectorsAreEqual =
      this.props.selectedWeightVector === prevProps.selectedWeightVector;
    const inspectedIndexesAreEqual =
      this.props.inspectedIndexes === prevProps.inspectedIndexes;
    if (!weightVectorsAreEqual || !inspectedIndexesAreEqual) {
      this.setState(
        this.updateViewedFeatureImportances(this.getSelectionDetails())
      );
    }
  }

  public render(): React.ReactNode {
    const testableDatapoints = this.state.includedFeatureImportance.map(
      (item) => item.unsortedFeatureValues as any[]
    );
    const testableDatapointColors = this.state.includedFeatureImportance.map(
      (item) => FluentUIStyles.fluentUIColorPalette[item.colorIndex]
    );
    const testableDatapointNames = this.state.includedFeatureImportance.map(
      (item) => item.name
    );
    return (
      <div>
        <Stack tokens={alignmentStackTokens}>
          <Stack.Item align="start">
            <Text variant={"xLarge"}>
              {localization.ErrorAnalysis.InspectionView.selectedDatapoints}
            </Text>
          </Stack.Item>
          {this._rows.length > 0 && (
            <Stack tokens={alignmentStackTokens}>
              <Stack.Item>
                <Fabric>
                  <DetailsList
                    items={this._rows}
                    columns={this._columns}
                    setKey="set"
                    layoutMode={DetailsListLayoutMode.justified}
                    onRenderItemColumn={this.renderItemColumn}
                    selectionPreservedOnEmptyClick
                    ariaLabelForSelectionColumn="Toggle selection"
                    ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                    checkButtonAriaLabel="Row checkbox"
                    selectionMode={SelectionMode.multiple}
                    selection={this._selection}
                  />
                </Fabric>
              </Stack.Item>
              <Stack.Item>
                <LocalImportancePlots
                  includedFeatureImportance={
                    this.state.includedFeatureImportance
                  }
                  jointDataset={this.props.jointDataset}
                  metadata={this.props.metadata}
                  selectedWeightVector={this.props.selectedWeightVector}
                  weightOptions={this.props.weightOptions}
                  weightLabels={this.props.weightLabels}
                  testableDatapoints={testableDatapoints}
                  testableDatapointColors={testableDatapointColors}
                  testableDatapointNames={testableDatapointNames}
                  featuresOption={this.featuresOption}
                  sortArray={this.state.sortArray}
                  sortingSeriesIndex={this.state.sortingSeriesIndex}
                  invokeModel={this.props.invokeModel}
                  onWeightChange={this.props.onWeightChange}
                />
              </Stack.Item>
            </Stack>
          )}
          {this._rows.length === 0 && (
            <Text variant={"medium"}>
              {localization.ErrorAnalysis.InspectionView.emptyError}
            </Text>
          )}
        </Stack>
      </div>
    );
  }

  private renderItemColumn = (
    item: any,
    index?: number,
    column?: IColumn
  ): React.ReactNode => {
    if (column && index !== undefined) {
      const fieldContent = item[column.fieldName as keyof any] as string;

      switch (column.key) {
        case "color":
          return (
            <div
              className={mergeStyles({
                backgroundColor: fieldContent,
                display: "block",
                height: "100%",
                width: "20px"
              })}
            />
          );

        default:
          return <span>{fieldContent}</span>;
      }
    }
    return <span />;
  };

  private updateViewedFeatureImportances(
    includedIndexes: number[]
  ): IInspectionViewState {
    const inspectedFeatureImportance = this.props.inspectedIndexes.map(
      (rowIndex, colorIndex) => {
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
    const includedFeatureImportance = inspectedFeatureImportance.filter((row) =>
      includedIndexes.includes(row.id)
    );
    let sortArray: number[] = [];
    let sortingSeriesIndex: number | undefined;
    if (includedFeatureImportance.length !== 0) {
      sortingSeriesIndex = 0;
      sortArray = ModelExplanationUtils.getSortIndices(
        includedFeatureImportance[0].unsortedAggregateY
      ).reverse();
    } else {
      sortingSeriesIndex = undefined;
    }
    return {
      includedFeatureImportance,
      sortArray,
      sortingSeriesIndex
    };
  }

  private getSelectionDetails(): number[] {
    const selectedRows = this._selection.getSelection();
    const keys = selectedRows.map((row) => row[0] as number);
    return keys;
  }
}
