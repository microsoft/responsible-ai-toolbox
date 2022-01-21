// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  MissingParametersPlaceholder,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  OverallMetricChart,
  BinaryClassificationMetrics,
  RegressionMetrics,
  JointDataset,
  generateMetrics,
  ErrorCohort,
  ILabeledStatistic
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import {
  Text,
  Dropdown,
  IDropdownOption,
  DetailsList,
  IColumn,
  IDetailsList,
  CheckboxVisibility,
  IGroup,
  IDetailsGroupRenderProps
} from "office-ui-fabric-react";
import React from "react";

import { modelOverviewStyles } from "./ModelOverview.styles";

class ModelOverviewProps {}

interface IModelOverviewState {
  selectedMetrics: string[];
}

export class ModelOverview extends React.Component<
  ModelOverviewProps,
  IModelOverviewState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private _root = React.createRef<IDetailsList>();

  constructor(props: ModelOverviewProps) {
    super(props);
    this.state = { selectedMetrics: [] };
  }

  public componentDidMount(): void {
    let defaultSelectedMetrics: string[] = [];
    if (this.context.dataset.task_type === "classification") {
      defaultSelectedMetrics = [
        BinaryClassificationMetrics.Accuracy,
        BinaryClassificationMetrics.FalsePositiveRate,
        BinaryClassificationMetrics.FalseNegativeRate,
        BinaryClassificationMetrics.SelectionRate
      ];
    } else {
      // task_type === "regression"
      defaultSelectedMetrics = [
        RegressionMetrics.MeanAbsoluteError,
        RegressionMetrics.MeanSquaredError,
        RegressionMetrics.MeanPrediction
      ];
    }
    this.setState({ selectedMetrics: defaultSelectedMetrics });
  }

  public render(): React.ReactNode {
    const classNames = modelOverviewStyles();
    if (!this.context.jointDataset.hasPredictedY) {
      return (
        <MissingParametersPlaceholder>
          {localization.Interpret.ModelPerformance.missingParameters}
        </MissingParametersPlaceholder>
      );
    }

    let selectableMetrics: IDropdownOption[] = [];
    if (this.context.dataset.task_type === "classification") {
      // TODO: what about multiclass classification?
      selectableMetrics.push(
        {
          key: BinaryClassificationMetrics.Accuracy,
          text: localization.ModelAssessment.ModelOverview.accuracy
        },
        {
          key: BinaryClassificationMetrics.F1Score,
          text: localization.ModelAssessment.ModelOverview.f1Score
        },
        {
          key: BinaryClassificationMetrics.Precision,
          text: localization.ModelAssessment.ModelOverview.precision
        },
        {
          key: BinaryClassificationMetrics.Recall,
          text: localization.ModelAssessment.ModelOverview.recall
        },
        {
          key: BinaryClassificationMetrics.FalsePositiveRate,
          text: localization.ModelAssessment.ModelOverview.falsePositiveRate
        },
        {
          key: BinaryClassificationMetrics.FalseNegativeRate,
          text: localization.ModelAssessment.ModelOverview.falseNegativeRate
        },
        {
          key: BinaryClassificationMetrics.SelectionRate,
          text: localization.ModelAssessment.ModelOverview.selectionRate
        }
      );
    } else {
      // task_type === "regression"
      selectableMetrics.push(
        {
          key: RegressionMetrics.MeanAbsoluteError,
          text: localization.ModelAssessment.ModelOverview.meanAbsoluteError
        },
        {
          key: RegressionMetrics.MeanSquaredError,
          text: localization.ModelAssessment.ModelOverview.meanSquaredError
        },
        {
          key: RegressionMetrics.MeanPrediction,
          text: localization.ModelAssessment.ModelOverview.meanPrediction
        }
      );
    }

    const columns: IColumn[] = [
      { key: "0", fieldName: "firstColumn", name: "Cohorts", minWidth: 150 }
    ].concat(
      selectableMetrics
        .filter((element) =>
          this.state.selectedMetrics.includes(element.key.toString())
        )
        .map((element, index) => {
          return {
            key: `${index + 1}`,
            fieldName: element.key.toString(),
            name: element.text,
            minWidth: 150
          };
        })
    );
    const manually_created_cohort_count = this.context.errorCohorts.length - 1;
    const groups: IGroup[] = [
      {
        key: "allData",
        name: localization.ErrorAnalysis.Cohort.defaultLabel,
        startIndex: 0,
        count: 1,
        level: 0
      },
      {
        key: "manuallyCreatedCohorts",
        name: localization.ModelAssessment.ModelOverview.manuallyCreatedCohorts,
        startIndex: 1,
        count: manually_created_cohort_count,
        level: 0
      },
      {
        key: "sensitiveFeatureCohorts",
        name: localization.ModelAssessment.ModelOverview
          .sensitiveFeatureCohorts,
        startIndex: 1 + manually_created_cohort_count,
        count: 0,
        level: 0
      }
    ];

    const labeledStatistics = generateMetrics(
      this.context.jointDataset,
      this.context.errorCohorts.map((errorCohort) =>
        errorCohort.cohort.unwrap(JointDataset.IndexLabel)
      ),
      this.context.modelMetadata.modelType
    );

    // move All Data cohort to the top of the table by adding it as the first row
    const allDataCohortIndex = this.context.errorCohorts.findIndex(
      (errorCohort) =>
        errorCohort.cohort.name ===
        localization.ErrorAnalysis.Cohort.defaultLabel
    );
    let items = this.context.errorCohorts.map((errorCohort, index) => {
      return this.generateTableRow(
        errorCohort,
        selectableMetrics,
        labeledStatistics,
        index
      );
    });
    const allDataRow = items.splice(allDataCohortIndex, 1)[0]; // remove
    items.splice(0, 0, allDataRow); // insert at the beginning

    return (
      <div className={classNames.page}>
        <div className={classNames.infoWithText}>
          <Text variant="medium">
            {localization.Interpret.ModelPerformance.helperText}
          </Text>
        </div>
        <OverallMetricChart showMetricSummary={false} />
        <Dropdown
          label={localization.ModelAssessment.ModelOverview.Metrics}
          selectedKeys={this.state.selectedMetrics}
          options={selectableMetrics}
          onChange={this.onMetricSelectionChange}
          multiSelect
          styles={{ dropdown: { width: 500 } }}
        />
        <DetailsList
          componentRef={this._root}
          items={items}
          groups={groups}
          columns={columns}
          ariaLabelForSelectAllCheckbox="Toggle selection for all items"
          ariaLabelForSelectionColumn="Toggle selection"
          checkButtonAriaLabel="select row"
          //checkButtonGroupAriaLabel="select section"
          //onRenderDetailsHeader={this._onRenderDetailsHeader}
          groupProps={{
            showEmptyGroups: true,
            onRenderHeader: this._onRenderGroupHeader
          }}
          //onRenderItemColumn={this._onRenderColumn}
          compact={false}
          checkboxVisibility={CheckboxVisibility.hidden}
        />
      </div>
    );
  }

  private generateTableRow(
    errorCohort: ErrorCohort,
    selectableMetrics: IDropdownOption[],
    labeledStatistics: ILabeledStatistic[][],
    index: number
  ) {
    let row = {
      key: errorCohort.cohort.getCohortID().toString(),
      firstColumn: errorCohort.cohort.name
    };
    selectableMetrics
      .filter((element: IDropdownOption) =>
        this.state.selectedMetrics.includes(element.key.toString())
      )
      .forEach((metricOption: IDropdownOption) => {
        const stat = labeledStatistics[index].find(
          (stat) => stat.key === metricOption.key
        );
        if (stat) {
          row[metricOption.key] = stat?.stat.toFixed(3);
          return;
        }
        row[metricOption.key] =
          localization.ModelAssessment.ModelOverview.notAvailable;
      });
    return row;
  }

  private onMetricSelectionChange = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item && item.selected !== undefined) {
      if (
        item.selected &&
        !this.state.selectedMetrics.includes(item.key.toString())
      ) {
        this.setState({
          selectedMetrics: this.state.selectedMetrics.concat([
            item.key.toString()
          ])
        });
      }
      if (
        !item.selected &&
        this.state.selectedMetrics.includes(item.key.toString())
      ) {
        let selectedMetrics = this.state.selectedMetrics;
        const unselectedMetricIndex = selectedMetrics.findIndex(
          (key) => key === item.key.toString()
        );
        // remove unselected metric
        selectedMetrics.splice(unselectedMetricIndex, 1);
        this.setState({
          selectedMetrics
        });
      }
    }
  };

  private _onRenderGroupHeader: IDetailsGroupRenderProps["onRenderHeader"] = (
    props,
    defaultRender
  ) => {
    if (props && props.group) {
      // never render group header for "All Data" since it's just a single row
      if (props.group.key === "allData") {
        return null;
      }
      // omit group header if there are no manually created cohorts
      if (
        props.group.key === "manuallyCreatedCohorts" &&
        props.group.count === 0
      ) {
        return null;
      }
      // omit group header if there are no sensitive feature cohorts
      if (
        props.group.key === "sensitiveFeatureCohorts" &&
        props.group.count === 0
      ) {
        return null;
      }
      return defaultRender ? defaultRender(props) : null;
    }
    return null;
  };
}
