// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ConstrainMode,
  DetailsList,
  DetailsListLayoutMode,
  Fabric,
  IGroup,
  MarqueeSelection,
  ScrollablePane,
  ScrollbarVisibility,
  Selection,
  SelectionMode,
  Stack,
  Text
} from "@fluentui/react";
import {
  constructCols,
  constructRows,
  defaultModelAssessmentContext,
  JointDataset,
  ModelTypes,
  LabelWithCallout,
  ModelAssessmentContext,
  TelemetryEventName,
  TelemetryLevels
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { tableViewStyles } from "./TableView.styles";
import { onRenderDetailsHeader } from "./TableViewDetailsHeader";
import { onRenderGroupHeader } from "./TableViewGroupHeader";
import { ITableViewProps } from "./TableViewProps";
import { IITableViewState, ITableViewTableState } from "./TableViewState";

export class TableView extends React.Component<
  ITableViewProps,
  IITableViewState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private readonly maxSelectable = 5;

  private selection: Selection = new Selection({
    onSelectionChanged: (): void => {
      const c = this.selection.getSelectedCount();
      const indices = this.selection.getSelectedIndices();
      if (c === this.maxSelectable) {
        this.setState({ selectedIndices: indices });
      }
      if (c > this.maxSelectable) {
        for (const index of indices) {
          if (!this.state.selectedIndices.includes(index)) {
            this.setState({ indexToUnselect: index });
          }
        }
      }
      this.props.onAllSelectedItemsChange(this.selection.getSelection());
      this.props.telemetryHook?.({
        level: TelemetryLevels.ButtonClick,
        type: TelemetryEventName.IndividualFeatureImportanceSelectedDatapointsUpdated
      });
    }
  });

  public constructor(props: ITableViewProps) {
    super(props);

    const tableState = this.updateItems();

    this.state = {
      indexToUnselect: undefined,
      selectedIndices: [],
      ...tableState
    };
  }

  public componentDidUpdate(prevProps: ITableViewProps): void {
    if (this.props.selectedCohort !== prevProps.selectedCohort) {
      this.setState(this.updateItems());
    }
    if (this.state.indexToUnselect) {
      this.selection.toggleIndexSelected(this.state.indexToUnselect);
      this.setState({ indexToUnselect: undefined });
    }
  }

  public render(): React.ReactNode {
    if (this.state.rows === undefined || this.state.columns === undefined) {
      return React.Fragment;
    }
    const hasTextImportances =
      !!this.context.modelExplanationData?.precomputedExplanations
        ?.textFeatureImportance;
    const classNames = tableViewStyles();
    return (
      <Stack tokens={{ padding: "l1" }}>
        <Stack.Item className={classNames.infoWithText}>
          <Text variant="medium">
            {localization.ModelAssessment.FeatureImportances.IndividualFeature}
          </Text>
        </Stack.Item>
        <Stack.Item className={classNames.selectionCounter}>
          <LabelWithCallout
            label={localization.formatString(
              localization.ModelAssessment.FeatureImportances.SelectionCounter,
              this.selection.count,
              this.maxSelectable
            )}
            calloutTitle={undefined}
            renderOnNewLayer
            type="label"
          >
            <Text>
              {localization.ModelAssessment.FeatureImportances.SelectionLimit}
            </Text>
          </LabelWithCallout>
        </Stack.Item>
        <Stack.Item className={classNames.tabularDataView}>
          <div style={{ height: "500px", position: "relative" }}>
            <Fabric>
              <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
                <MarqueeSelection selection={this.selection}>
                  <DetailsList
                    items={this.state.rows}
                    columns={this.state.columns}
                    groups={this.state.groups}
                    setKey="set"
                    layoutMode={DetailsListLayoutMode.fixedColumns}
                    constrainMode={ConstrainMode.unconstrained}
                    onRenderDetailsHeader={onRenderDetailsHeader}
                    selectionPreservedOnEmptyClick
                    ariaLabelForSelectionColumn={
                      localization.ModelAssessment.FeatureImportances
                        .SelectionColumnAriaLabel
                    }
                    checkButtonAriaLabel={
                      localization.ModelAssessment.FeatureImportances
                        .RowCheckboxAriaLabel
                    }
                    groupProps={{
                      onRenderHeader: onRenderGroupHeader,
                      showEmptyGroups: true
                    }}
                    selectionMode={
                      hasTextImportances
                        ? SelectionMode.single
                        : SelectionMode.multiple
                    }
                    selection={this.selection}
                  />
                </MarqueeSelection>
              </ScrollablePane>
            </Fabric>
          </div>
        </Stack.Item>
      </Stack>
    );
  }

  private updateItems(): ITableViewTableState {
    let groups: IGroup[] | undefined;

    // assume classifier by default, otherwise regressor
    if (
      this.props.modelType &&
      this.props.modelType === ModelTypes.Regression
    ) {
      // don't use groups since there are no correct/incorrect buckets
      this.props.selectedCohort.cohort.sort();
    } else {
      this.props.selectedCohort.cohort.sortByGroup(
        JointDataset.IndexLabel,
        (row) =>
          row[JointDataset.TrueYLabel] === row[JointDataset.PredictedYLabel]
      );
      // find first incorrect item
      const firstIncorrectItemIndex =
        this.props.selectedCohort.cohort.filteredData.findIndex(
          (row) =>
            row[JointDataset.TrueYLabel] !== row[JointDataset.PredictedYLabel]
        );
      const noIncorrectItem = firstIncorrectItemIndex === -1;

      groups = [
        {
          count: noIncorrectItem
            ? this.props.selectedCohort.cohort.filteredData.length
            : firstIncorrectItemIndex,
          isCollapsed: true,
          key: "groupCorrect",
          level: 0,
          name: localization.ModelAssessment.FeatureImportances
            .CorrectPredictions,
          startIndex: 0
        },
        {
          count: noIncorrectItem
            ? 0
            : this.props.selectedCohort.cohort.filteredData.length -
              firstIncorrectItemIndex,
          key: "groupIncorrect",
          level: 0,
          name: localization.ModelAssessment.FeatureImportances
            .IncorrectPredictions,
          startIndex: firstIncorrectItemIndex
        }
      ];
    }

    const cohortData = this.props.selectedCohort.cohort.filteredData;
    const numRows: number = cohortData.length;
    const indices = this.props.selectedCohort.cohort.filteredData.map(
      (row: { [key: string]: number }) => {
        return row[JointDataset.IndexLabel] as number;
      }
    );

    const rows = constructRows(
      cohortData,
      this.props.jointDataset,
      numRows,
      () => false, // don't filter any items
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
      groups,
      rows
    };
  }
}
