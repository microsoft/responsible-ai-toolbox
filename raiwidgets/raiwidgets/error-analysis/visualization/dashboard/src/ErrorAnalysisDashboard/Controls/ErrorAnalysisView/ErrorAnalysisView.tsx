import React from "react";
import { Stack } from "office-ui-fabric-react/lib/Stack";
import { HelpMessageDict } from "../../Interfaces/IStringsParam";
import { errorAnalysisOptions } from "../../ErrorAnalysisDashboard";
import { TreeViewRenderer } from "../TreeViewRenderer/TreeViewRenderer";
import { MatrixFilter } from "../MatrixFilter/MatrixFilter";

export interface IErrorAnalysisViewProps {
  theme?: string;
  messages?: HelpMessageDict;
  features: string[];
  selectedFeatures: string[];
  getTreeNodes: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
  getMatrix: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
  errorAnalysisOption: errorAnalysisOptions;
}

export class ErrorAnalysisView extends React.PureComponent<
  IErrorAnalysisViewProps
> {
  public render(): React.ReactNode {
    return (
      <>
        <div className="mainPage">
          <div className="errorAnalysisView">
            {this.props.errorAnalysisOption ===
              errorAnalysisOptions.treeMap && (
              <TreeViewRenderer
                theme={this.props.theme}
                messages={this.props.messages}
                getTreeNodes={this.props.getTreeNodes}
                selectedFeatures={this.props.selectedFeatures}
              />
            )}
            {this.props.errorAnalysisOption ===
              errorAnalysisOptions.heatMap && (
              <MatrixFilter
                theme={this.props.theme}
                features={this.props.features}
                getMatrix={this.props.getMatrix}
              />
            )}
          </div>
        </div>
      </>
    );
  }

  public componentDidUpdate(prevProps: IErrorAnalysisViewProps): void {
    if (this.props.selectedFeatures != prevProps.selectedFeatures) {
      this.forceUpdate();
    }
  }
}
