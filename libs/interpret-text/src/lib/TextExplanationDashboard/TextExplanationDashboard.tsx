// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ChoiceGroup,
  IChoiceGroupOption,
  IStackTokens,
  Label,
  Slider,
  Stack,
  Text
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { RadioKeys, Utils } from "./CommonUtils";
import { BarChart } from "./Control/BarChart/BarChart";
import { TextHighlighting } from "./Control/TextHighlighting/TextHightlighting";
import { ITextExplanationDashboardProps } from "./Interfaces/IExplanationDashboardProps";
import { textExplanationDashboardStyles } from "./TextExplanationDashboard.styles";

export interface ITextExplanationDashboardState {
  /*
   * holds the state of the dashboard
   */
  maxK: number;
  topK: number;
  radio: string;
}

const options: IChoiceGroupOption[] = [
  /*
   * creates the choices for the radio button
   */
  { key: RadioKeys.All, text: localization.InterpretText.Dashboard.allButton },
  { key: RadioKeys.Pos, text: localization.InterpretText.Dashboard.posButton },
  { key: RadioKeys.Neg, text: localization.InterpretText.Dashboard.negButton }
];

const componentStackTokens: IStackTokens = {
  childrenGap: "m",
  padding: "m"
};

const legendStackTokens: IStackTokens = {
  childrenGap: "m",
  padding: "s"
};

export class TextExplanationDashboard extends React.PureComponent<
  ITextExplanationDashboardProps,
  ITextExplanationDashboardState
> {
  constructor(props: ITextExplanationDashboardProps) {
    /*
     * initializes the dashboard with its state
     */
    super(props);
    this.state = {
      maxK: Math.min(
        15,
        Math.ceil(Utils.countNonzeros(this.props.dataSummary.localExplanations))
      ),
      radio: RadioKeys.All,
      topK: Math.ceil(
        Utils.countNonzeros(this.props.dataSummary.localExplanations) / 2
      )
    };
  }

  public render() {
    const classNames = textExplanationDashboardStyles();
    return (
      <Stack>
        <Stack tokens={componentStackTokens}>
          <Stack.Item>
            <Slider
              min={1}
              max={this.state.maxK}
              step={1}
              defaultValue={this.state.topK}
              showValue={false}
              onChange={(value) => this.setTopK(value)}
            />
          </Stack.Item>
          <Stack.Item align="center">
            <Text variant={"large"}>
              {`${this.state.topK.toString()} ${
                localization.InterpretText.Dashboard.importantWords
              }`}
            </Text>
          </Stack.Item>
        </Stack>
        <Stack tokens={componentStackTokens} horizontal>
          <Stack.Item grow disableShrink>
            <BarChart
              text={this.props.dataSummary.text}
              localExplanations={this.props.dataSummary.localExplanations}
              topK={this.state.topK}
              radio={this.state.radio}
            />
          </Stack.Item>
          <Stack.Item grow className={classNames.chartRight}>
            <Stack tokens={componentStackTokens}>
              <Stack.Item>
                <Text variant={"xLarge"}>
                  {localization.InterpretText.Dashboard.label +
                    localization.InterpretText.Dashboard.colon +
                    Utils.predictClass(
                      this.props.dataSummary.classNames!,
                      this.props.dataSummary.prediction!
                    )}
                </Text>
              </Stack.Item>
              <Stack.Item>
                <ChoiceGroup
                  defaultSelectedKey="all"
                  options={options}
                  onChange={this.changeRadioButton}
                  required
                />
              </Stack.Item>
              <Stack.Item>
                <Text variant={"small"}>
                  {localization.InterpretText.Dashboard.legendText}
                </Text>
              </Stack.Item>
            </Stack>
          </Stack.Item>
        </Stack>
        <Stack tokens={componentStackTokens} horizontal>
          <Stack.Item
            grow
            disableShrink
            className={classNames.textHighlighting}
          >
            <TextHighlighting
              text={this.props.dataSummary.text}
              localExplanations={this.props.dataSummary.localExplanations}
              topK={this.state.topK}
              radio={this.state.radio}
            />
          </Stack.Item>
          <Stack.Item grow>
            <Stack tokens={componentStackTokens}>
              <Stack.Item>
                <Text variant={"large"} className={classNames.legend}>
                  {localization.InterpretText.Dashboard.featureLegend}
                </Text>
              </Stack.Item>
              <Stack.Item>
                <Stack horizontal tokens={legendStackTokens}>
                  <Stack.Item align="center">
                    <Label className={classNames.posFeatureImportance}>A</Label>
                  </Stack.Item>
                  <Stack.Item align="center">
                    <Text>
                      {
                        localization.InterpretText.Dashboard
                          .posFeatureImportance
                      }
                    </Text>
                  </Stack.Item>
                </Stack>
              </Stack.Item>
              <Stack.Item>
                <Stack horizontal tokens={legendStackTokens}>
                  <Stack.Item align="center">
                    <Label className={classNames.negFeatureImportance}>A</Label>
                  </Stack.Item>
                  <Stack.Item align="center">
                    <Text>
                      {
                        localization.InterpretText.Dashboard
                          .negFeatureImportance
                      }
                    </Text>
                  </Stack.Item>
                </Stack>
              </Stack.Item>
            </Stack>
          </Stack.Item>
        </Stack>
      </Stack>
    );
  }

  private setTopK(newNumber: number): void {
    /*
     * changes the state of K
     */
    this.setState({ topK: newNumber });
  }

  private changeRadioButton = (
    _event?: React.FormEvent,
    item?: IChoiceGroupOption
  ): void => {
    /*
     * changes the state of the radio button
     */
    if (item?.key !== undefined) {
      this.setState({ radio: item.key });
    }
  };
}
