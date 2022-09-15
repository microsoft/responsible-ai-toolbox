// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Callout, Stack, Text, TextField } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ITelemetryEvent,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { CounterfactualListSetValue } from "./CounterfactualListSetValue";
import { counterfactualPanelStyles } from "./CounterfactualPanel.styles";
import { CustomPredictionLabels } from "./CustomPredictionLabels";

export interface ICounterfactualListColumnNameProps {
  selectedIndex: number;
  data: Record<string, string | number>;
  index?: number | undefined;
  item?: Record<string, string | number>;
  nameColumnKey: string;
  temporaryPoint: Record<string, string | number> | undefined;
  showCallout: boolean;
  onSelect: (idx: number) => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
  toggleCallout: () => void;
  updateColValue: (
    evt: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ) => void;
}

export class CounterfactualListColumnName extends React.Component<ICounterfactualListColumnNameProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  public render(): React.ReactNode {
    if (this.props.index === -1) {
      const classNames = counterfactualPanelStyles();
      return (
        <Stack>
          <Stack.Item>
            <TextField
              value={this.props.data[this.props.nameColumnKey]?.toString()}
              label={localization.Counterfactuals.createOwn}
              id={this.props.nameColumnKey}
              disabled
              onChange={this.props.updateColValue}
            />
          </Stack.Item>
          {this.context.requestPredictions && (
            <Stack.Item className={classNames.predictedLink}>
              <div
                id={"predictionLink"}
                className={classNames.predictedLink}
                onMouseOver={this.props.toggleCallout}
                onFocus={this.props.toggleCallout}
                onMouseOut={this.props.toggleCallout}
                onBlur={this.props.toggleCallout}
              >
                {localization.Counterfactuals.seePrediction}
              </div>
              {this.props.showCallout && (
                <Callout
                  target={"#predictionLink"}
                  onDismiss={this.props.toggleCallout}
                  setInitialFocus
                >
                  <CustomPredictionLabels
                    jointDataset={this.context.jointDataset}
                    metadata={this.context.modelMetadata}
                    selectedWhatIfRootIndex={this.props.selectedIndex}
                    temporaryPoint={this.props.temporaryPoint}
                  />
                </Callout>
              )}
            </Stack.Item>
          )}
        </Stack>
      );
    }
    if (this.props.index === undefined || !this.props.item?.row) {
      return React.Fragment;
    }
    return (
      <Stack>
        <Text>{this.props.item.row}</Text>
        {this.context.requestPredictions && (
          <CounterfactualListSetValue
            index={this.props.index}
            onSelect={this.props.onSelect}
            telemetryHook={this.props.telemetryHook}
          />
        )}
      </Stack>
    );
  }
}
