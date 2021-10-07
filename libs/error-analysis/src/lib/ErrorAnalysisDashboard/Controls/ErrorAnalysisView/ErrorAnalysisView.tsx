// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ICompositeFilter,
  IFilter,
  CohortSource,
  defaultModelAssessmentContext,
  ErrorCohort,
  MetricCohortStats,
  ModelAssessmentContext,
  IErrorAnalysisTreeNode,
  IErrorAnalysisMatrix
} from "@responsible-ai/core-ui";
import React from "react";

import { ErrorAnalysisOptions } from "../../ErrorAnalysisEnums";
import { HelpMessageDict } from "../../Interfaces/IStringsParam";
import { IMatrixAreaState, IMatrixFilterState } from "../../MatrixFilterState";
import { ITreeViewRendererState } from "../../TreeViewState";
import { MatrixFilter } from "../Matrix/MatrixFilter/MatrixFilter";
import { TreeViewRenderer } from "../TreeViewRenderer/TreeViewRenderer";

export interface IErrorAnalysisViewProps {
  messages?: HelpMessageDict;
  disabledView: boolean;
  features: string[];
  selectedFeatures: string[];
  getTreeNodes?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<IErrorAnalysisTreeNode[]>;
  getMatrix?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<IErrorAnalysisMatrix>;
  tree?: IErrorAnalysisTreeNode[];
  matrix?: IErrorAnalysisMatrix;
  matrixFeatures?: string[];
  errorAnalysisOption: ErrorAnalysisOptions;
  updateSelectedCohort: (
    filters: IFilter[],
    compositeFilters: ICompositeFilter[],
    source: CohortSource,
    cells: number,
    cohortStats: MetricCohortStats | undefined
  ) => void;
  selectedCohort: ErrorCohort;
  baseCohort: ErrorCohort;
  treeViewState: ITreeViewRendererState;
  setTreeViewState: (treeViewState: ITreeViewRendererState) => void;
  matrixFilterState: IMatrixFilterState;
  matrixAreaState: IMatrixAreaState;
  setMatrixAreaState: (matrixAreaState: IMatrixAreaState) => void;
  setMatrixFilterState: (matrixFilterState: IMatrixFilterState) => void;
  showCohortName: boolean;
}

export class ErrorAnalysisView extends React.Component<IErrorAnalysisViewProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const matrixViewIsEnabled = this.props.getMatrix !== undefined;
    return (
      <>
        {this.props.errorAnalysisOption === ErrorAnalysisOptions.TreeMap && (
          <TreeViewRenderer
            theme={this.context.theme}
            messages={this.props.messages}
            getTreeNodes={this.props.getTreeNodes}
            tree={this.props.tree}
            features={this.props.features}
            selectedFeatures={this.props.selectedFeatures}
            updateSelectedCohort={this.props.updateSelectedCohort}
            selectedCohort={this.props.selectedCohort}
            baseCohort={this.props.baseCohort}
            state={this.props.treeViewState}
            setTreeViewState={this.props.setTreeViewState}
            showCohortName={this.props.showCohortName}
            disabledView={this.props.disabledView}
          />
        )}
        {this.props.errorAnalysisOption === ErrorAnalysisOptions.HeatMap && (
          <MatrixFilter
            theme={this.context.theme}
            features={this.props.features}
            getMatrix={this.props.getMatrix}
            matrix={this.props.matrix}
            matrixFeatures={this.props.matrixFeatures}
            updateSelectedCohort={this.props.updateSelectedCohort}
            selectedCohort={this.props.selectedCohort}
            baseCohort={this.props.baseCohort}
            state={this.props.matrixFilterState}
            matrixAreaState={this.props.matrixAreaState}
            setMatrixAreaState={this.props.setMatrixAreaState}
            setMatrixFilterState={this.props.setMatrixFilterState}
            isEnabled={matrixViewIsEnabled}
            disabledView={this.props.disabledView}
          />
        )}
      </>
    );
  }

  public componentDidUpdate(prevProps: IErrorAnalysisViewProps): void {
    if (
      this.props.selectedFeatures !== prevProps.selectedFeatures ||
      this.props.treeViewState !== prevProps.treeViewState ||
      this.props.matrixFilterState !== prevProps.matrixFilterState ||
      this.props.matrixAreaState !== prevProps.matrixAreaState
    ) {
      this.forceUpdate();
    }
  }
}
