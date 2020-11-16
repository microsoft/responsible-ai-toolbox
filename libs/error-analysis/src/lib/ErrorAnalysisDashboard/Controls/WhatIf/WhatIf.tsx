// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FabricStyles,
  IExplanationModelMetadata,
  JointDataset,
  WhatIfConstants,
  WhatIfPanel
} from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import { IFocusTrapZoneProps, IDropdownOption } from "office-ui-fabric-react";
import { Panel } from "office-ui-fabric-react/lib/Panel";
import React from "react";

import { ErrorCohort } from "../../ErrorCohort";

import { whatIfStyles } from "./WhatIf.styles";

export interface IWhatIfProps {
  isOpen: boolean;
  // hostId: string
  onDismiss: () => void;
  jointDataset: JointDataset;
  metadata: IExplanationModelMetadata;
  currentCohort: ErrorCohort;
  invokeModel?: (data: any[], abortSignal: AbortSignal) => Promise<any[]>;
  customPoints: Array<{ [key: string]: any }>;
  addCustomPoint: (temporaryPoint: { [key: string]: any }) => void;
}

export interface IWhatIfState {
  filteredFeatureList: IDropdownOption[];
  selectedWhatIfRootIndex: number;
  editingDataCustomIndex?: number;
}

const focusTrapZoneProps: IFocusTrapZoneProps = {
  forceFocusInsideTrap: false,
  isClickableOutsideFocusTrap: true
};

export class WhatIf extends React.Component<IWhatIfProps, IWhatIfState> {
  private rowOptions: IDropdownOption[] | undefined;
  private stringifedValues: { [key: string]: string } = {};
  private temporaryPoint: { [key: string]: any } | undefined;
  private validationErrors: { [key: string]: string | undefined } = {};
  private featuresOption: IDropdownOption[] = new Array(
    this.props.jointDataset.datasetFeatureCount
  )
    .fill(0)
    .map((_, index) => {
      const key = JointDataset.DataLabelRoot + index.toString();
      const meta = this.props.jointDataset.metaDict[key];
      const options = meta.isCategorical
        ? meta.sortedCategoricalValues?.map((optionText, index) => {
            return { key: index, text: optionText };
          })
        : undefined;
      return {
        data: {
          categoricalOptions: options,
          fullLabel: meta.label.toLowerCase()
        },
        key,
        text: meta.abbridgedLabel
      };
    });
  public constructor(props: IWhatIfProps) {
    super(props);
    this.state = {
      filteredFeatureList: this.featuresOption,
      selectedWhatIfRootIndex: 0
    };

    this.createCopyOfFirstRow();
    this.buildRowOptions();
  }

  public render(): React.ReactNode {
    const classNames = whatIfStyles();
    return (
      <Panel
        headerText="What If"
        isOpen={this.props.isOpen}
        focusTrapZoneProps={focusTrapZoneProps}
        // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
        closeButtonAriaLabel="Close"
        // layerProps={{ hostId: this.props.hostId }}
        isBlocking={false}
        onDismiss={this.props.onDismiss}
      >
        <div className={classNames.divider}></div>
        <div className={classNames.section}>
          <div className={classNames.subsection}>
            <WhatIfPanel
              dismissPanel={this.props.onDismiss}
              filterFeatures={this.filterFeatures}
              filteredFeatureList={this.state.filteredFeatureList}
              isPanelOpen={this.props.isOpen}
              isInPanel={true}
              jointDataset={this.props.jointDataset}
              metadata={this.props.metadata}
              openPanel={(): void => {
                // do nothing
              }}
              rowOptions={this.rowOptions}
              saveAsPoint={this.saveAsPoint}
              savePoint={this.savePoint}
              selectedWhatIfRootIndex={this.state.selectedWhatIfRootIndex}
              setCustomRowProperty={this.setCustomRowProperty}
              setCustomRowPropertyDropdown={this.setCustomRowPropertyDropdown}
              setSelectedIndex={this.setSelectedIndex}
              stringifedValues={this.stringifedValues}
              temporaryPoint={this.temporaryPoint}
              validationErrors={this.validationErrors}
              editingDataCustomIndex={this.state.editingDataCustomIndex}
              invokeModel={this.props.invokeModel}
            />
          </div>
        </div>
      </Panel>
    );
  }

  private filterFeatures = (
    _event?: React.ChangeEvent<HTMLInputElement>,
    newValue?: string
  ): void => {
    if (newValue === undefined || newValue === null || !/\S/.test(newValue)) {
      this.setState({ filteredFeatureList: this.featuresOption });
      return;
    }
    const filteredFeatureList = this.featuresOption.filter((item) => {
      return item.data.fullLabel.includes(newValue.toLowerCase());
    });
    this.setState({ filteredFeatureList });
  };

  private buildRowOptions(): void {
    this.props.currentCohort.cohort.sort(JointDataset.IndexLabel);
    this.rowOptions = this.props.currentCohort.cohort
      .unwrap(JointDataset.IndexLabel)
      .map((index) => {
        return {
          key: index,
          text: localization.formatString(
            localization.Interpret.WhatIfTab.rowLabel,
            index.toString()
          )
        };
      })
      .reverse();
  }

  private saveAsPoint = (): void => {
    if (this.temporaryPoint) {
      this.props.addCustomPoint(this.temporaryPoint);
    }
  };

  private savePoint = (): void => {
    // do nothing
  };

  private setCustomRowProperty = (): void => {
    // do nothing
  };

  private setCustomRowPropertyDropdown = (): void => {
    // do nothing
  };

  private setSelectedIndex = (
    _event: React.FormEvent,
    item?: IDropdownOption
  ): void => {
    if (item?.key !== undefined) {
      this.setTemporaryPointToCopyOfDatasetPoint(item.key as number);
    }
  };

  private setTemporaryPointToCopyOfDatasetPoint(index: number): void {
    this.temporaryPoint = this.props.jointDataset.getRow(index);
    this.temporaryPoint[WhatIfConstants.namePath] = localization.formatString(
      localization.Interpret.WhatIf.defaultCustomRootName,
      index
    );
    this.temporaryPoint[WhatIfConstants.colorPath] =
      FabricStyles.fabricColorPalette[
        WhatIfConstants.MAX_SELECTION + this.props.customPoints.length
      ];
    Object.keys(this.temporaryPoint).forEach((key) => {
      this.stringifedValues[key] = this.temporaryPoint?.[key].toString();
      this.validationErrors[key] = undefined;
    });
    this.setState({
      editingDataCustomIndex: undefined,
      selectedWhatIfRootIndex: index
    });
  }

  private createCopyOfFirstRow(): void {
    const indexes = this.getDefaultSelectedPointIndexes(
      this.props.currentCohort
    );
    if (indexes.length === 0) {
      return undefined;
    }
    this.temporaryPoint = this.props.jointDataset.getRow(indexes[0]);
    this.temporaryPoint[WhatIfConstants.namePath] = localization.formatString(
      localization.Interpret.WhatIf.defaultCustomRootName,
      indexes[0]
    );
    this.temporaryPoint[WhatIfConstants.colorPath] =
      FabricStyles.fabricColorPalette[
        WhatIfConstants.MAX_SELECTION + this.props.customPoints.length
      ];
    Object.keys(this.temporaryPoint).forEach((key) => {
      this.stringifedValues[key] = this.temporaryPoint?.[key].toString();
      this.validationErrors[key] = undefined;
    });
  }

  private getDefaultSelectedPointIndexes(errorCohort: ErrorCohort): number[] {
    const indexes = errorCohort.cohort.unwrap(JointDataset.IndexLabel);
    if (indexes.length > 0) {
      return [indexes[0]];
    }
    return [];
  }
}
