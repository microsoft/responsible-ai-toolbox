// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICompositeFilter, IFilter } from "@responsible-ai/interpret";
import { ITheme } from "office-ui-fabric-react";
import React from "react";

import { ErrorAnalysisOptions } from "../../ErrorAnalysisDashboard";
import { ErrorCohort, ErrorDetectorCohortSource } from "../../ErrorCohort";
import { HelpMessageDict } from "../../Interfaces/IStringsParam";
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
    cells: number
  ) => void;
  selectedCohort: ErrorCohort;
}

export class ErrorAnalysisView extends React.PureComponent<
  IErrorAnalysisViewProps
> {
  public render(): React.ReactNode {
    return (
      <div className="mainPage">
        <div className="errorAnalysisView">
          {this.props.errorAnalysisOption === ErrorAnalysisOptions.TreeMap && (
            <TreeViewRenderer
              theme={this.props.theme}
              messages={this.props.messages}
              getTreeNodes={this.props.getTreeNodes}
              selectedFeatures={this.props.selectedFeatures}
              updateSelectedCohort={this.props.updateSelectedCohort}
              selectedCohort={this.props.selectedCohort}
            />
          )}
          {this.props.errorAnalysisOption === ErrorAnalysisOptions.HeatMap && (
            <MatrixFilter
              theme={this.props.theme}
              features={this.props.features}
              getMatrix={this.props.getMatrix}
              updateSelectedCohort={this.props.updateSelectedCohort}
              selectedCohort={this.props.selectedCohort}
            />
          )}
        </div>
      </div>
    );
  }

  public componentDidUpdate(prevProps: IErrorAnalysisViewProps): void {
    if (this.props.selectedFeatures !== prevProps.selectedFeatures) {
      this.forceUpdate();
    }
  }
}
