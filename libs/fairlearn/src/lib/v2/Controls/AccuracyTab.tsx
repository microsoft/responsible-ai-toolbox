import { Text, FocusZone } from "office-ui-fabric-react";
import { Stack, StackItem } from "office-ui-fabric-react/lib/Stack";
import React from "react";
import { IAccuracyPickerPropsV2 } from "../FairnessWizard";
import { PredictionTypesV2 } from "../IFairnessProps";
import { IWizardTabProps } from "../IWizardTabProps";
import { localization } from "../Localization/localization";
import { AccuracyTabStyles } from "./AccuracyTab.styles";
import { DataSpecificationBlade } from "./DataSpecificationBlade";
import { TileList } from "./TileList";
import { WizardFooter } from "./WizardFooter";

export interface IAccuracyPickingTabProps extends IWizardTabProps {
  accuracyPickerProps: IAccuracyPickerPropsV2;
}

export class AccuracyTab extends React.PureComponent<IAccuracyPickingTabProps> {
  public render(): React.ReactNode {
    const styles = AccuracyTabStyles();
    return (
      <Stack
        horizontal
        horizontalAlign="space-between"
        className={styles.frame}
      >
        <Stack className={styles.main}>
          <Text className={styles.header} block>
            {localization.Accuracy.header}
          </Text>
          <Text className={styles.textBody} block>
            {localization.formatString(
              localization.Accuracy.body,
              this.props.dashboardContext.modelMetadata.PredictionTypeV2 !==
                PredictionTypesV2.regression
                ? localization.Accuracy.binary
                : localization.Accuracy.continuous,
              this.props.dashboardContext.modelMetadata.PredictionTypeV2 ===
                PredictionTypesV2.binaryClassification
                ? localization.Accuracy.binary
                : localization.Accuracy.continuous,
              this.props.dashboardContext.predictions.length === 1
                ? localization.Accuracy.modelMakes
                : localization.Accuracy.modelsMake
            )}
          </Text>
          <StackItem grow={2} className={styles.itemsList}>
            <FocusZone shouldFocusOnMount={true}>
              <TileList
                items={this.props.accuracyPickerProps.accuracyOptions.map(
                  (accuracy) => {
                    return {
                      title: accuracy.title,
                      description: accuracy.description,
                      onSelect: this.props.accuracyPickerProps.onAccuracyChange.bind(
                        this,
                        accuracy.key
                      ),
                      selected:
                        this.props.accuracyPickerProps.selectedAccuracyKey ===
                        accuracy.key
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
