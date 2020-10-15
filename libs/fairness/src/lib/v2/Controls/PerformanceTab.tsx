// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { Text, FocusZone } from "office-ui-fabric-react";
import { Stack, StackItem } from "office-ui-fabric-react/lib/Stack";
import React from "react";

import { DataSpecificationBlade } from "../../components/DataSpecificationBlade";
import { IWizardTabProps } from "../../components/IWizardTabProps";
import { WizardFooter } from "../../components/WizardFooter";
import { PredictionTypes } from "../../IFairnessProps";
import { IPerformancePickerPropsV2 } from "../FairnessWizard";

import { PerformanceTabStyles } from "./PerformanceTab.styles";
import { TileList } from "./TileList";

export interface IPerformancePickingTabProps extends IWizardTabProps {
  performancePickerProps: IPerformancePickerPropsV2;
}

export class PerformanceTab extends React.PureComponent<
  IPerformancePickingTabProps
> {
  public render(): React.ReactNode {
    const styles = PerformanceTabStyles();
    return (
      <Stack
        horizontal
        horizontalAlign="space-between"
        className={styles.frame}
      >
        <Stack className={styles.main}>
          <Text className={styles.header} block>
            {localization.Fairness.Performance.header}
          </Text>
          <Text className={styles.textBody} block>
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
          <StackItem grow={2} className={styles.itemsList}>
            <FocusZone shouldFocusOnMount={true}>
              <TileList
                items={this.props.performancePickerProps.performanceOptions.map(
                  (performance) => {
                    return {
                      description: performance.description,
                      onSelect: this.props.performancePickerProps.onPerformanceChange.bind(
                        this,
                        performance.key
                      ),
                      selected:
                        this.props.performancePickerProps
                          .selectedPerformanceKey === performance.key,
                      title: performance.title
                    };
                  }
                )}
              />
            </FocusZone>
          </StackItem>
          <WizardFooter
            onNext={this.props.onNext}
            onPrevious={this.props.onPrevious}
          />
        </Stack>
        <DataSpecificationBlade
          numberRows={this.props.dashboardContext.trueY.length}
          featureNames={this.props.dashboardContext.modelMetadata.featureNames}
        />
      </Stack>
    );
  }
}
