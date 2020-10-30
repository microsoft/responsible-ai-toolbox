// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "office-ui-fabric-react";
import React from "react";

import { ErrorAnalysisOptions } from "../../ErrorAnalysisDashboard";
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
            />
          )}
          {this.props.errorAnalysisOption === ErrorAnalysisOptions.HeatMap && (
            <MatrixFilter
              theme={this.props.theme}
              features={this.props.features}
              getMatrix={this.props.getMatrix}
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
