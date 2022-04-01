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
  constructCols,
  ModelTypes,
  LabelWithCallout
} from "@responsible-ai/core-ui";
import { IGlobalSeries, LocalImportancePlots } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import {
  ConstrainMode,
  DetailsList,
  DetailsListLayoutMode,
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
  IColumn,
  IGroup,
  Text,
  IDetailsGroupDividerProps,
  Icon
} from "office-ui-fabric-react";
import React from "react";

import { individualFeatureImportanceViewStyles } from "./IndividualFeatureImportanceView.styles";

export interface IIndividualFeatureImportanceProps {
  features: string[];
  jointDataset: JointDataset;
  invokeModel?: (data: any[], abortSignal: AbortSignal) => Promise<any[]>;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
  onWeightChange: (option: WeightVectorOption) => void;
  selectedCohort: ErrorCohort;
  modelType?: ModelTypes;
}

export interface IIndividualFeatureImportanceTableState {
  rows: any[];
  columns: IColumn[];
  groups?: IGroup[];
}

export interface IIndividualFeatureImportanceState
  extends IIndividualFeatureImportanceTableState {
  featureImportances: IGlobalSeries[];
  indexToUnselect?: number;
  selectedIndices: number[];
  sortArray: number[];
  sortingSeriesIndex?: number;
}

export class IndividualFeatureImportanceView extends React.Component<
  IIndividualFeatureImportanceProps,
  IIndividualFeatureImportanceState
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
      this.updateViewedFeatureImportances();
    }
  });

  public constructor(props: IIndividualFeatureImportanceProps) {
    super(props);

    const tableState = this.updateItems();

    this.state = {
      featureImportances: [],
      indexToUnselect: undefined,
      selectedIndices: [],
      sortArray: [],
      ...tableState
    };
  }

  public componentDidUpdate(
    prevProps: IIndividualFeatureImportanceProps
  ): void {
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
    const classNames = individualFeatureImportanceViewStyles();

    return (
      <Stack tokens={{ padding: "l1" }}>
        <Stack.Item>
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
            <Text block>
              {localization.ModelAssessment.FeatureImportances.SelectionLimit}
            </Text>
          </LabelWithCallout>
        </Stack.Item>
        <Stack.Item className="tabularDataView">
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
                    onRenderDetailsHeader={this.onRenderDetailsHeader}
                    selectionPreservedOnEmptyClick
                    ariaLabelForSelectionColumn="Toggle selection"
                    checkButtonAriaLabel="Row checkbox"
                    // checkButtonGroupAriaLabel="Group checkbox"
                    groupProps={{
                      onRenderHeader: this._onRenderGroupHeader,
                      showEmptyGroups: true
                    }}
                    selectionMode={SelectionMode.multiple}
                    selection={this.selection}
                  />
                </MarqueeSelection>
              </ScrollablePane>
            </Fabric>
          </div>
        </Stack.Item>
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

  private updateViewedFeatureImportances(): void {
    const allSelectedItems = this.selection.getSelection();
    const featureImportances = allSelectedItems.map(
      (row, colorIndex): IGlobalSeries => {
        const rowDict = this.props.jointDataset.getRow(row[0]);
        return {
          colorIndex,
          id: rowDict[JointDataset.IndexLabel],
          name: localization.formatString(
            localization.Interpret.WhatIfTab.rowLabel,
            rowDict[JointDataset.IndexLabel].toString()
          ),
          unsortedAggregateY: JointDataset.localExplanationSlice(
            rowDict,
            this.props.jointDataset.localExplanationFeatureCount
          ) as number[],
          unsortedFeatureValues: JointDataset.datasetSlice(
            rowDict,
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
    this.setState({
      featureImportances,
      sortArray,
      sortingSeriesIndex
    });
  }

  private updateItems(): IIndividualFeatureImportanceTableState {
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

  private onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps> = (
    props,
    defaultRender
  ) => {
    if (!props) {
      return <div />;
    }
    const onRenderColumnHeaderTooltip: IRenderFunction<IDetailsColumnRenderTooltipProps> =
      (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />;
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

  private _onRenderGroupHeader = (props?: IDetailsGroupDividerProps) => {
    const classNames = individualFeatureImportanceViewStyles();
    const iconName = props?.group?.isCollapsed
      ? "ChevronRightMed"
      : "ChevronDownMed";
    return (
      <Stack className={classNames.header} horizontal>
        <Icon
          ariaLabel="expand collapse group"
          className={classNames.chevronButton}
          iconName={iconName}
          onClick={this._onToggleCollapse(props)}
        />
        <span className={classNames.headerTitle}>{props?.group!.name}</span>
        &nbsp;
        <span className={classNames.headerCount}>
          {`(${props?.group!.count})`}
        </span>
      </Stack>
    );
  };

  private _onToggleCollapse = (props?: IDetailsGroupDividerProps) => {
    return () => {
      props!.onToggleCollapse!(props!.group!);
    };
  };
}
