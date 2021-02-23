// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  JointDataset,
  IExplanationModelMetadata
} from "@responsible-ai/core-ui";
import {
  FabricStyles,
  WhatIfConstants,
  WhatIfPanel
} from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import {
  IComboBoxOption,
  IDropdownOption,
  IFocusTrapZoneProps,
  Panel
} from "office-ui-fabric-react";
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
  selectedIndex: number | undefined;
}

export interface IWhatIfState {
  filteredFeatureList: IDropdownOption[];
  selectedWhatIfRootIndex: number;
  editingDataCustomIndex?: number;
  request?: AbortController;
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
      editingDataCustomIndex: undefined,
      filteredFeatureList: this.featuresOption,
      request: undefined,
      selectedWhatIfRootIndex: 0
    };

    this.createCopyOfFirstRow();
    this.buildRowOptions();
  }

  public componentDidUpdate(prevProps: IWhatIfProps): void {
    if (
      this.props.selectedIndex !== prevProps.selectedIndex &&
      this.props.selectedIndex !== undefined
    ) {
      this.setTemporaryPointToCopyOfDatasetPoint(this.props.selectedIndex);
    }
  }

  public render(): React.ReactNode {
    const classNames = whatIfStyles();
    return (
      <Panel
        headerText={localization.ErrorAnalysis.WhatIfPanel.whatIfHeader}
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
      this.props.addCustomPoint(_.cloneDeep(this.temporaryPoint));
    }
  };

  private savePoint = (): void => {
    // do nothing
  };

  private setCustomRowProperty = (
    key: string | number,
    isString: boolean,
    newValue?: string
  ): void => {
    if (!this.temporaryPoint || !newValue) {
      return;
    }
    const editingData = this.temporaryPoint;
    this.stringifedValues[key] = newValue;
    if (isString) {
      editingData[key] = newValue;
      this.forceUpdate();
    } else {
      const asNumber = +newValue;
      // because " " evaluates to 0 in js
      const isWhitespaceOnly = /^\s*$/.test(newValue);
      if (Number.isNaN(asNumber) || isWhitespaceOnly) {
        this.validationErrors[key] =
          localization.Interpret.WhatIfTab.nonNumericValue;
        this.forceUpdate();
      } else {
        editingData[key] = asNumber;
        this.validationErrors[key] = undefined;
        this.forceUpdate();
        this.fetchData(editingData);
      }
    }
  };

  private setCustomRowPropertyDropdown = (
    key: string | number,
    option?: IComboBoxOption,
    value?: string
  ): void => {
    if (!this.temporaryPoint) {
      return;
    }
    const editingData = this.temporaryPoint;
    if (option) {
      // User selected/de-selected an existing option
      editingData[key] = option.key;
    } else if (value !== undefined) {
      // User typed a freeform option
      const featureOption = this.featuresOption.find(
        (feature) => feature.key === key
      );
      if (featureOption) {
        featureOption.data.categoricalOptions.push({ key: value, text: value });
      }
      editingData[key] = value;
    }

    this.forceUpdate();
    this.fetchData(editingData);
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
    this.props.currentCohort.cohort.sort();
    this.temporaryPoint = this.props.currentCohort.cohort.filteredData[
      indexes[0]
    ];
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

  // fetch prediction for temporary point
  private fetchData(fetchingReference: { [key: string]: any }): void {
    if (!this.props.invokeModel) {
      return;
    }
    if (this.state.request !== undefined) {
      this.state.request.abort();
    }
    const abortController = new AbortController();
    const rawData = JointDataset.datasetSlice(
      fetchingReference,
      this.props.jointDataset.metaDict,
      this.props.jointDataset.datasetFeatureCount
    );
    // This seems to break the dashboard for long requests
    // fetchingReference[JointDataset.PredictedYLabel] = undefined;
    const promise = this.props.invokeModel([rawData], abortController.signal);

    this.setState({ request: abortController }, async () => {
      try {
        const fetchedData = await promise;
        // returns predicted probabilities
        if (Array.isArray(fetchedData[0])) {
          const predictionVector = fetchedData[0];
          let predictedClass = 0;
          let maxProb = Number.MIN_SAFE_INTEGER;
          for (const [i, element] of predictionVector.entries()) {
            fetchingReference[
              JointDataset.ProbabilityYRoot + i.toString()
            ] = element;
            if (element > maxProb) {
              predictedClass = i;
              maxProb = element;
            }
          }
          fetchingReference[JointDataset.PredictedYLabel] = predictedClass;
        } else {
          // prediction is a scalar, no probabilities
          fetchingReference[JointDataset.PredictedYLabel] = fetchedData[0];
        }
        if (this.props.jointDataset.hasTrueY) {
          JointDataset.setErrorMetrics(
            fetchingReference,
            this.props.metadata.modelType
          );
        }
        this.setState({ request: undefined });
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
        if (error.name === "PythonError") {
          alert(
            localization.formatString(
              localization.Interpret.IcePlot.errorPrefix,
              error.message
            )
          );
        }
      }
    });
  }
}
