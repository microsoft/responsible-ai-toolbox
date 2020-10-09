// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INumericRange, RangeTypes } from "@responsible-ai/mlchartlib";
import {
  ActionButton,
  Modal,
  Stack,
  Text,
  DetailsList,
  SelectionMode,
  IColumn,
  Selection,
  ISelection
} from "office-ui-fabric-react";
import React from "react";

import { localization } from "@responsible-ai/localization";
import { IBinnedResponse } from "../util/IBinnedResponse";

import { BinDialog } from "./BinDialog";
import { DataSpecificationBlade } from "./DataSpecificationBlade";
import { FeatureTabStyles } from "./FeatureTab.styles";
import { FeatureTabSubGroup } from "./FeatureTabSubGroup";
import { IWizardTabProps } from "./IWizardTabProps";
import { WizardFooter } from "./WizardFooter";

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
  private selection: ISelection;
  public constructor(props: IFeatureTabProps) {
    super(props);
    this.selection = new Selection({
      onSelectionChanged: (): void => {
        const select = this.selection.getSelectedIndices()[0];
        if (
          select !== undefined &&
          select !== this.props.selectedFeatureIndex
        ) {
          this.props.selectedFeatureChange(select);
        }
      }
    });
    this.state = {
      editingFeatureIndex: undefined,
      expandedBins: new Set<number>()
    };
    this.columns = [
      {
        key: "feature",
        minWidth: 75,
        name: localization.Intro.features,
        onRender: this.renderFeatureNameCell
      },
      {
        key: "subgroup",
        minWidth: 130,
        name: localization.Feature.subgroups,
        onRender: this.renderSubGroupCell
      }
    ];
  }
  public componentDidMount(): void {
    setImmediate(() => {
      this.selection.setIndexSelected(
        this.props.selectedFeatureIndex,
        true,
        false
      );
    });
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
            selection={this.selection}
            selectionPreservedOnEmptyClick={true}
            getKey={this.getKey}
            setKey="set"
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

  private readonly getKey = (item: IBinnedResponse): string => {
    return this.props.featureBins.indexOf(item).toString();
  };

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
        {item.rangeType === RangeTypes.Categorical && (
          <Text variant={"mediumPlus"} className={styles.valueCount} block>
            {localization.formatString(
              localization.Feature.summaryCategoricalCount,
              item.array.length
            )}
          </Text>
        )}
        {item.rangeType !== RangeTypes.Categorical && (
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
