// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IComboBox,
  ComboBox,
  Stack,
  DefaultButton
} from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  FluentUIStyles
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { causalIndividualChartStyles } from "../CausalIndividualChart.styles";
import { CausalWhatIf } from "../CausalWhatIf";

import {
  absoluteIndexKey,
  getDataOptions
} from "./largeCausalIndividualChartUtils";

export interface ILargeCausalIndividualChartLegendProps {
  indexSeries: number[];
  selectedPointsIndexes: number[];
  isLocalCausalDataLoading?: boolean;
  temporaryPoint?: { [key: string]: any };
  isBubbleChartRendered?: boolean;
  onRevertButtonClick: () => void;
  selectPointFromDropdown: (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption | undefined
  ) => void;
}

export class LargeCausalIndividualChartLegend extends React.PureComponent<ILargeCausalIndividualChartLegendProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const classNames = causalIndividualChartStyles();

    return (
      <Stack.Item>
        {this.props.indexSeries.length > 0 && (
          <Stack className={classNames.legendAndText}>
            <ComboBox
              label={
                localization.CausalAnalysis.IndividualView.selectedDatapoint
              }
              onChange={this.props.selectPointFromDropdown}
              options={getDataOptions(this.props.indexSeries)}
              selectedKey={`${this.props.selectedPointsIndexes[0]}`}
              ariaLabel={"datapoint picker"}
              useComboBoxAsMenuWidth
              styles={FluentUIStyles.smallDropdownStyle}
              disabled={this.props.isLocalCausalDataLoading}
            />
            <CausalWhatIf
              selectedIndex={this.props.selectedPointsIndexes[0]}
              isLocalCausalDataLoading={this.props.isLocalCausalDataLoading}
              absoluteIndex={
                this.props.temporaryPoint
                  ? this.props.temporaryPoint[absoluteIndexKey]
                  : undefined
              }
            />
            {!this.props.isBubbleChartRendered && (
              <DefaultButton
                className={classNames.buttonStyle}
                onClick={this.props.onRevertButtonClick}
                text={localization.Counterfactuals.revertToBubbleChart}
                title={localization.Counterfactuals.revertToBubbleChart}
                disabled={this.props.isLocalCausalDataLoading}
              />
            )}
          </Stack>
        )}
      </Stack.Item>
    );
  }
}
