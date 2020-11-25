// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { Text, Stack } from "office-ui-fabric-react";
import React from "react";

import { DataSpecificationBlade } from "../../components/DataSpecificationBlade";
import { IWizardTabProps } from "../../components/IWizardTabProps";
import { WizardFooter } from "../../components/WizardFooter";
import { PredictionTypes } from "../../IFairnessProps";
import { IPerformancePickerPropsV2 } from "../FairnessWizard";

import { SelectionList } from "./SelectionList";

export interface IPerformancePickingTabProps extends IWizardTabProps {
  performancePickerProps: IPerformancePickerPropsV2;
}

export class PerformanceTab extends React.PureComponent<
  IPerformancePickingTabProps
> {
  public render(): React.ReactNode {
    return (
      <Stack>
        <Stack horizontal horizontalAlign="space-between">
          <Stack
            tokens={{ childrenGap: "l1", padding: "26px 0" }}
            styles={{ root: { display: "flex" } }}
          >
            <Text variant={"xLarge"} block>
              {localization.Fairness.Performance.header}
            </Text>
            <Text block>
              {localization.formatString(
                localization.Fairness.Performance.body,
                this.props.dashboardContext.modelMetadata.PredictionType !==
                  PredictionTypes.Regression
                  ? localization.Fairness.Performance.binary
                  : localization.Fairness.Performance.continuous,
                this.props.dashboardContext.modelMetadata.PredictionType ===
                  PredictionTypes.BinaryClassification
                  ? localization.Fairness.Performance.binary
                  : localization.Fairness.Performance.continuous,
                this.props.dashboardContext.predictions.length === 1
                  ? localization.Fairness.Performance.modelMakes
                  : localization.Fairness.Performance.modelsMake
              )}
            </Text>
          </Stack>
          <DataSpecificationBlade
            numberRows={this.props.dashboardContext.trueY.length}
            featureNames={
              this.props.dashboardContext.modelMetadata.featureNames
            }
          />
        </Stack>
        <SelectionList
          grouped={false}
          defaultSelectedKey={
            this.props.performancePickerProps.selectedPerformanceKey
          }
          items={this.props.performancePickerProps.performanceOptions.map(
            (performance) => {
              return {
                description: performance.description,
                key: performance.key,
                metric: performance.key,
                name: performance.title,
                onSelect: this.props.performancePickerProps.onPerformanceChange.bind(
                  this,
                  performance.key
                )
              };
            }
          )}
        />
        <WizardFooter
          onNext={this.props.onNext}
          onPrevious={this.props.onPrevious}
        />
      </Stack>
    );
  }
}
