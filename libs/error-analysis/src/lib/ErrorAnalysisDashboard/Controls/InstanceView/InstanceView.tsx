// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JointDataset } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import {
  IPivotItemProps,
  PivotItem,
  Pivot,
  PivotLinkSize,
  ITheme
} from "office-ui-fabric-react";
import { mergeStyleSets } from "office-ui-fabric-react/lib/Styling";
import React from "react";

import { HelpMessageDict } from "../../Interfaces/IStringsParam";
import { TabularDataView } from "../TabularDataView";

import { InstanceViewStyles } from "./InstanceView.styles";

// require('./InstanceView.css');

export interface IInstanceViewProps {
  theme?: ITheme;
  messages?: HelpMessageDict;
  features: string[];
  jointDataset: JointDataset;
}

export interface IInstanceViewState {
  features: string[];
  activePredictionTab: PredictionTabKeys;
}

enum PredictionTabKeys {
  CorrectPredictionTab = "CorrectPredictionTab",
  WrongPredictionTab = "WrongPredictionTab"
}

export class InstanceView extends React.PureComponent<
  IInstanceViewProps,
  IInstanceViewState
> {
  private static readonly classNames = mergeStyleSets({
    pivotWrapper: {
      display: "contents"
    }
  });

  private pivotItems: IPivotItemProps[] = [];
  public constructor(props: IInstanceViewProps) {
    super(props);
    this.state = {
      activePredictionTab: PredictionTabKeys.CorrectPredictionTab,
      features: this.props.features
    };

    this.pivotItems.push({
      headerText: localization.ErrorAnalysis.correctPrediction,
      itemKey: PredictionTabKeys.CorrectPredictionTab
    });
    this.pivotItems.push({
      headerText: localization.ErrorAnalysis.wrongPrediction,
      itemKey: PredictionTabKeys.WrongPredictionTab
    });
  }

  public render(): React.ReactNode {
    const classNames = InstanceViewStyles();
    return (
      <div className={InstanceView.classNames.pivotWrapper}>
        <Pivot
          selectedKey={this.state.activePredictionTab}
          onLinkClick={this._handlePredictionTabClick.bind(this)}
          linkSize={PivotLinkSize.normal}
          headersOnly={true}
          styles={{ root: classNames.pivotLabelWrapper }}
        >
          {this.pivotItems.map((props) => (
            <PivotItem key={props.itemKey} {...props} />
          ))}
        </Pivot>
        {this.state.activePredictionTab ===
          PredictionTabKeys.CorrectPredictionTab && (
          <div className="tabularDataView">
            <TabularDataView
              theme={this.props.theme}
              messages={this.props.messages}
              features={this.props.features}
              jointDataset={this.props.jointDataset}
            />
          </div>
        )}
        {this.state.activePredictionTab ===
          PredictionTabKeys.WrongPredictionTab && (
          <div className="tabularDataView">
            <TabularDataView
              theme={this.props.theme}
              messages={this.props.messages}
              features={this.props.features}
              jointDataset={this.props.jointDataset}
            />
          </div>
        )}
      </div>
    );
  }

  private _handlePredictionTabClick(item?: PivotItem): void {
    if (item !== undefined) {
      const itemKey: string = item.props.itemKey!;
      const index: PredictionTabKeys = PredictionTabKeys[itemKey];
      this.setState({ activePredictionTab: index });
    }
  }
}
