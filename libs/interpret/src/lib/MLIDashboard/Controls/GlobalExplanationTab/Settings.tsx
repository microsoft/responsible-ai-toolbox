import React from "react";
import {
  IconButton,
  DirectionalHint,
  Text,
  ChoiceGroup,
  SpinButton,
  Callout,
  IChoiceGroupOption
} from "office-ui-fabric-react";
import { toNumber, isInteger } from "lodash";
import { FabricStyles } from "../../FabricStyles";
import { ChartTypes } from "../../ChartTypes";
import { localization } from "../../../Localization/localization";
import { globalTabStyles } from "./GlobalExplanationTab.styles";

interface ISettingsProps {
  minK: number;
  maxK: number;
  chartType: ChartTypes;
  topK: number;
  onChartTypeChange(chartType: ChartTypes): void;
  setTopK(val: number): void;
}
interface ISettingsState {
  calloutVisible: boolean;
}

export class Settings extends React.Component<ISettingsProps, ISettingsState> {
  private chartConfigId = "GlobalExplanationSettingsButton";
  private chartOptions: IChoiceGroupOption[] = [
    {
      key: ChartTypes.Bar,
      text: localization.FeatureImportanceWrapper.barText
    },
    { key: ChartTypes.Box, text: localization.FeatureImportanceWrapper.boxText }
  ];
  public constructor(props: ISettingsProps) {
    super(props);
    this.state = {
      calloutVisible: false
    };
  }
  public render(): React.ReactNode {
    const classNames = globalTabStyles();
    return (
      <>
        <IconButton
          className={classNames.chartEditorButton}
          onClick={this.toggleCalloutOpen}
          iconProps={{ iconName: "Settings" }}
          id={this.chartConfigId}
        />
        {this.state.calloutVisible && (
          <Callout
            doNotLayer={true}
            className={classNames.callout}
            gapSpace={0}
            target={`#${this.chartConfigId}`}
            isBeakVisible={false}
            onDismiss={this.closeCallout}
            directionalHint={DirectionalHint.bottomRightEdge}
            setInitialFocus={true}
            styles={{ container: FabricStyles.calloutContainer }}
            id="GlobalExplanationSettingsCallout"
          >
            <Text variant="medium" className={classNames.boldText}>
              {localization.DatasetExplorer.chartType}
            </Text>
            <ChoiceGroup
              selectedKey={this.props.chartType}
              options={this.chartOptions}
              onChange={this.onChartTypeChange}
              id="ChartTypeSelection"
            />
            <SpinButton
              className={classNames.topK}
              styles={{
                spinButtonWrapper: { maxWidth: "100px" },
                labelWrapper: { alignSelf: "center" },
                root: {
                  float: "right",
                  selectors: {
                    "> div": {
                      maxWidth: "110px"
                    }
                  }
                }
              }}
              label={localization.AggregateImportance.topKFeatures}
              min={this.props.minK}
              max={this.props.maxK}
              value={this.props.topK.toString()}
              onIncrement={this.onIncrement}
              onDecrement={this.onDecrement}
              onValidate={this.onValidate}
              id="TopKSetting"
            />
          </Callout>
        )}
      </>
    );
  }

  private toggleCalloutOpen = (): void => {
    this.setState({ calloutVisible: !this.state.calloutVisible });
  };

  private closeCallout = (): void => {
    this.setState({ calloutVisible: false });
  };

  private onChartTypeChange = (
    _event?: React.FormEvent,
    item?: IChoiceGroupOption
  ): void => {
    if (item?.key !== undefined) {
      this.props.onChartTypeChange(item.key as ChartTypes);
    }
  };

  private readonly onIncrement = (): string | void => {
    return this.validateTopK(this.props.topK + 1);
  };

  private readonly onDecrement = (): string | void => {
    return this.validateTopK(this.props.topK - 1);
  };

  private readonly onValidate = (stringVal: string): string | void => {
    return this.validateTopK(toNumber(stringVal));
  };

  private readonly validateTopK = (val: number): string => {
    const newVal = this.getValidTopK(val);
    this.props.setTopK(newVal);
    return newVal.toString();
  };

  private readonly getValidTopK = (val: number): number => {
    const newVal = toNumber(val);
    if (!isInteger(newVal)) {
      return this.props.topK;
    }
    if (newVal > this.props.maxK) {
      return this.props.maxK;
    }
    if (newVal < this.props.minK) {
      return this.props.minK;
    }
    return newVal;
  };
}
