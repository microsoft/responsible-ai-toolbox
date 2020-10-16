import React from "react";
import { HelpMessageDict } from "../../Interfaces";
import { mergeStyleSets } from "office-ui-fabric-react/lib/Styling";
import {
  IPivot,
  IPivotItemProps,
  PivotItem,
  Pivot,
  PivotLinkSize
} from "office-ui-fabric-react/lib/Pivot";
import { InstanceViewStyles } from "./InstanceView.styles";
import { localization } from "../../../Localization/localization";
import { TabularDataView } from "../TabularDataView";
import { JointDataset } from "../../JointDataset";

// require('./InstanceView.css');

export interface IInstanceViewProps {
  theme?: string;
  messages?: HelpMessageDict;
  features: string[];
  jointDataset: JointDataset;
}

export interface IInstanceViewState {
  features: string[];
  activePredictionTab: predictionTabKeys;
}

enum predictionTabKeys {
  correctPredictionTab = "correctPredictionTab",
  wrongPredictionTab = "wrongPredictionTab"
}

export class InstanceView extends React.PureComponent<
  IInstanceViewProps,
  IInstanceViewState
> {
  private pivotRef: IPivot;
  private pivotItems: IPivotItemProps[] = [];
  constructor(props: IInstanceViewProps) {
    super(props);
    this.state = {
      features: this.props.features,
      activePredictionTab: predictionTabKeys.correctPredictionTab
    };

    this.pivotItems.push({
      headerText: localization.correctPrediction,
      itemKey: predictionTabKeys.correctPredictionTab
    });
    this.pivotItems.push({
      headerText: localization.wrongPrediction,
      itemKey: predictionTabKeys.wrongPredictionTab
    });
  }

  private static readonly classNames = mergeStyleSets({
    pivotWrapper: {
      display: "contents"
    }
  });

  public render(): React.ReactNode {
    const classNames = InstanceViewStyles();
    return (
      <div className={InstanceView.classNames.pivotWrapper}>
        <Pivot
          componentRef={(ref) => {
            this.pivotRef = ref;
          }}
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
          predictionTabKeys.correctPredictionTab && (
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
          predictionTabKeys.wrongPredictionTab && (
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

  private _handlePredictionTabClick(item: PivotItem): void {
    let index: predictionTabKeys = predictionTabKeys[item.props.itemKey];
    this.setState({ activePredictionTab: index });
  }
}
