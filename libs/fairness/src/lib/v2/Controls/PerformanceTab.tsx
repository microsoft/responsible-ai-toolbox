// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Text, FocusZone } from "office-ui-fabric-react";
import { Stack, StackItem } from "office-ui-fabric-react/lib/Stack";
import React from "react";

import { DataSpecificationBlade } from "../../components/DataSpecificationBlade";
import { IWizardTabProps } from "../../components/IWizardTabProps";
import { WizardFooter } from "../../components/WizardFooter";
import { PredictionTypes } from "../../IFairnessProps";
import { localization } from "../../Localization/localization";
import { IPerformancePickerPropsV2 } from "../FairnessWizard";

import { PerformanceTabStyles } from "./PerformanceTab.styles";
import { TileList } from "./TileList";

export interface IPerformancePickingTabProps extends IWizardTabProps {
  performancePickerProps: IPerformancePickerPropsV2;
}

export class PerformanceTab extends React.PureComponent<IPerformancePickingTabProps> {
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
            {localization.Performance.header}
          </Text>
          <Text className={styles.textBody} block>
            {localization.formatString(
              localization.Performance.body,
              this.props.dashboardContext.modelMetadata.PredictionType !==
                PredictionTypes.Regression
                ? localization.Performance.binary
                : localization.Performance.continuous,
              this.props.dashboardContext.modelMetadata.PredictionType ===
                PredictionTypes.BinaryClassification
                ? localization.Performance.binary
                : localization.Performance.continuous,
              this.props.dashboardContext.predictions.length === 1
                ? localization.Performance.modelMakes
                : localization.Performance.modelsMake
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
                        this.props.performancePickerProps.selectedPerformanceKey ===
                        performance.key,
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
