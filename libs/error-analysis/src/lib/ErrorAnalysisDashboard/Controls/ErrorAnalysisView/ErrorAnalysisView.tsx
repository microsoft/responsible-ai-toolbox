// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ICompositeFilter,
  IFilter,
  ErrorDetectorCohortSource,
  CohortStats,
  ErrorCohort
} from "@responsible-ai/core-ui";
import { ITheme } from "office-ui-fabric-react";
import React from "react";

import { ErrorAnalysisOptions } from "../../ErrorAnalysisEnums";
import { HelpMessageDict } from "../../Interfaces/IStringsParam";
import { IMatrixAreaState, IMatrixFilterState } from "../../MatrixFilterState";
import { ITreeViewRendererState } from "../../TreeViewState";
import { MatrixFilter } from "../MatrixFilter/MatrixFilter";
import { TreeViewRenderer } from "../TreeViewRenderer/TreeViewRenderer";

export interface IErrorAnalysisViewProps {
  theme?: ITheme;
  messages?: HelpMessageDict;
  features: string[];
  selectedFeatures: string[];
  getTreeNodes?: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
  getMatrix?: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
  errorAnalysisOption: ErrorAnalysisOptions;
  updateSelectedCohort: (
    filters: IFilter[],
    compositeFilters: ICompositeFilter[],
    source: ErrorDetectorCohortSource,
    cells: number,
    cohortStats: CohortStats | undefined
  ) => void;
  selectedCohort: ErrorCohort;
  baseCohort: ErrorCohort;
  treeViewState: ITreeViewRendererState;
  setTreeViewState: (treeViewState: ITreeViewRendererState) => void;
  matrixFilterState: IMatrixFilterState;
  matrixAreaState: IMatrixAreaState;
  setMatrixAreaState: (matrixAreaState: IMatrixAreaState) => void;
  setMatrixFilterState: (matrixFilterState: IMatrixFilterState) => void;
}

export class ErrorAnalysisView extends React.PureComponent<
  IErrorAnalysisViewProps
> {
  public render(): React.ReactNode {
    return (
      <>
        {this.props.errorAnalysisOption === ErrorAnalysisOptions.TreeMap && (
          <TreeViewRenderer
            theme={this.props.theme}
            messages={this.props.messages}
            getTreeNodes={this.props.getTreeNodes}
            features={this.props.features}
            selectedFeatures={this.props.selectedFeatures}
            updateSelectedCohort={this.props.updateSelectedCohort}
            selectedCohort={this.props.selectedCohort}
            baseCohort={this.props.baseCohort}
            state={this.props.treeViewState}
            setTreeViewState={this.props.setTreeViewState}
          />
        )}
        {this.props.errorAnalysisOption === ErrorAnalysisOptions.HeatMap && (
          <MatrixFilter
            theme={this.props.theme}
            features={this.props.features}
            getMatrix={this.props.getMatrix}
            updateSelectedCohort={this.props.updateSelectedCohort}
            selectedCohort={this.props.selectedCohort}
            baseCohort={this.props.baseCohort}
            state={this.props.matrixFilterState}
            matrixAreaState={this.props.matrixAreaState}
            setMatrixAreaState={this.props.setMatrixAreaState}
            setMatrixFilterState={this.props.setMatrixFilterState}
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
