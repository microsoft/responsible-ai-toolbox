import { INumericRange, RangeTypes } from "@responsible-ai/mlchartlib";
import {
  ActionButton,
  Modal,
  Stack,
  Text,
  DetailsList,
  SelectionMode,
  IColumn
} from "office-ui-fabric-react";

import React from "react";
import { IBinnedResponse } from "../util/IBinnedResponse";
import { localization } from "../Localization/localization";
import { IWizardTabProps } from "./IWizardTabProps";
import { BinDialog } from "./BinDialog";
import { DataSpecificationBlade } from "./DataSpecificationBlade";
import { WizardFooter } from "./WizardFooter";
import { FeatureTabStyles } from "./FeatureTab.styles";
import { FeatureTabSubGroup } from "./FeatureTabSubGroup";

export interface IFeatureTabProps extends IWizardTabProps {
  featureBins: IBinnedResponse[];
  selectedFeatureIndex: number;
  selectedFeatureChange: (value: number) => void;
  saveBin: (bin: IBinnedResponse) => void;
}

interface IState {
  expandedBins: Set<number>;
  editingFeatureIndex: number | undefined;
}

export class FeatureTab extends React.PureComponent<IFeatureTabProps, IState> {
  private columns: IColumn[];
  public constructor(props: IFeatureTabProps) {
    super(props);
    this.state = {
      expandedBins: new Set<number>(),
      editingFeatureIndex: undefined
    };
    this.columns = [
      {
        key: "feature",
        name: localization.Intro.features,
        minWidth: 75,
        onRender: this.renderFeatureNameCell
      },
      {
        key: "subgroup",
        name: localization.Feature.subgroups,
        minWidth: 130,
        onRender: this.renderSubGroupCell
      }
    ];
  }

  public render(): React.ReactNode {
    const styles = FeatureTabStyles();
    return (
      <Stack
        horizontal
        horizontalAlign="space-between"
        className={styles.frame}
      >
        <Modal
          isOpen={this.state.editingFeatureIndex !== undefined}
          isBlocking={false}
          onDismiss={this.hideModal}
        >
          {this.state.editingFeatureIndex !== undefined && (
            <BinDialog
              range={
                this.props.dashboardContext.modelMetadata.featureRanges[
                  this.state.editingFeatureIndex
                ] as INumericRange
              }
              bins={this.props.featureBins[this.state.editingFeatureIndex]}
              dataset={this.props.dashboardContext.dataset || []}
              index={this.state.editingFeatureIndex}
              onSave={this.onBinSave}
              onCancel={this.hideModal}
            />
          )}
        </Modal>
        <Stack className={styles.main}>
          <Text variant={"mediumPlus"} className={styles.header} block>
            {localization.Feature.header}
          </Text>
          <Text className={styles.textBody} block>
            {localization.Feature.body}
          </Text>
          <DetailsList
            items={this.props.featureBins}
            columns={this.columns}
            selectionMode={SelectionMode.single}
          />
          <WizardFooter onNext={this.props.onNext} />
        </Stack>
        <DataSpecificationBlade
          numberRows={this.props.dashboardContext.trueY.length}
          featureNames={this.props.dashboardContext.modelMetadata.featureNames}
        />
      </Stack>
    );
  }

  private readonly hideModal = (): void => {
    this.setState({ editingFeatureIndex: undefined });
  };

  private readonly onBinSave = (bin: IBinnedResponse): void => {
    this.setState({ editingFeatureIndex: undefined });
    this.props.saveBin(bin);
  };

  private readonly editBins = (index: number): void => {
    this.setState({ editingFeatureIndex: index });
  };

  private readonly renderFeatureNameCell = (
    item?: IBinnedResponse,
    index?: number | undefined
  ): React.ReactNode => {
    if (index === undefined || !item) {
      return undefined;
    }
    const styles = FeatureTabStyles();
    return (
      <>
        <Text className={styles.itemTitle} block>
          {this.props.dashboardContext.modelMetadata.featureNames[index]}
        </Text>
        {item.rangeType === RangeTypes.categorical && (
          <Text variant={"mediumPlus"} className={styles.valueCount} block>
            {localization.formatString(
              localization.Feature.summaryCategoricalCount,
              item.array.length
            )}
          </Text>
        )}
        {item.rangeType !== RangeTypes.categorical && (
          <Text variant={"mediumPlus"} className={styles.valueCount} block>
            {localization.formatString(
              localization.Feature.summaryNumericCount,
              (this.props.dashboardContext.modelMetadata.featureRanges[
                index
              ] as INumericRange).min,
              (this.props.dashboardContext.modelMetadata.featureRanges[
                index
              ] as INumericRange).max,
              item.labelArray.length
            )}
          </Text>
        )}
        {!this.props.dashboardContext.modelMetadata.featureIsCategorical?.[
          index
        ] && (
          <ActionButton
            className={styles.expandButton}
            iconProps={{ iconName: "Edit" }}
            onClick={this.editBins.bind(this, index)}
          >
            {localization.Feature.editBinning}
          </ActionButton>
        )}
      </>
    );
  };

  private readonly renderSubGroupCell = (
    item?: IBinnedResponse
  ): React.ReactNode => {
    if (!item) {
      return undefined;
    }
    return <FeatureTabSubGroup item={item} />;
  };
}
