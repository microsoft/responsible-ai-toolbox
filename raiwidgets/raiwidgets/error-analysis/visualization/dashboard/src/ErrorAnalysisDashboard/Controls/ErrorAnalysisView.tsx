import React from "react";
import { Stack } from "office-ui-fabric-react/lib/Stack";
import { HelpMessageDict } from "../Interfaces";
import { TreeViewRenderer } from "./TreeViewRenderer";

require("./ErrorAnalysisView.css");

export interface IErrorAnalysisViewProps {
  theme?: string;
  messages?: HelpMessageDict;
  features: string[];
  selectedFeatures: string[];
  getTreeNodes: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
}

export class ErrorAnalysisView extends React.PureComponent<
  IErrorAnalysisViewProps
> {
  public render(): React.ReactNode {
    return (
      <>
        <div className="mainPage">
          <div className="treeViewRenderer">
            <TreeViewRenderer
              theme={this.props.theme}
              messages={this.props.messages}
              getTreeNodes={this.props.getTreeNodes}
              selectedFeatures={this.props.selectedFeatures}
            />
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
