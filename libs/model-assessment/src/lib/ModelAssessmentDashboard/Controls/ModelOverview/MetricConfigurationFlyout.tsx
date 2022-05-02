// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  Stack,
  Panel,
  PrimaryButton,
  DefaultButton,
  MessageBar,
  MessageBarType,
  Text,
  Selection,
  CheckboxVisibility,
  SelectionMode,
  DetailsList,
  PanelType,
  IColumn
} from "office-ui-fabric-react";
import React from "react";
import { IMetricOption } from "./StatsTableUtils";

interface IMetricConfigurationFlyoutProps {
  isOpen: boolean;
  onDismissFlyout: () => void;
  selectedMetrics: string[];
  selectableMetrics: IMetricOption[];
  updateSelectedMetrics: (metrics: string[]) => void;
}

interface IMetricConfigurationFlyoutState {
  newlySelectedMetrics: string[];
  items: IMetricConfigurationRow[];
}

interface IMetricConfigurationRow {
  key: string;
  metricName: string;
  metricDescription: string;
}

export class MetricConfigurationFlyout extends React.Component<
  IMetricConfigurationFlyoutProps,
  IMetricConfigurationFlyoutState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private _selection: Selection;

  constructor(props: IMetricConfigurationFlyoutProps) {
    super(props);

    this._selection = new Selection({
      onSelectionChanged: () => {
        const selectedMetrics = this._selection
          .getSelection()
          .map((objWithKey) => objWithKey.key?.toString() ?? "")
          .slice();
        this.setState({ newlySelectedMetrics: selectedMetrics });
      }
    });

    this.state = {
      newlySelectedMetrics: this.props.selectedMetrics,
      items: []
    };
    this.updateSelection();
  }

  componentDidMount() {
    this.setState({ items: this.getItems() }, () => {
      this.updateSelection();
    });
  }

  componentDidUpdate(prevProps: IMetricConfigurationFlyoutProps) {
    if (
      this.props.selectedMetrics.length !== prevProps.selectedMetrics.length ||
      this.props.selectedMetrics.some((metricName, index) => {
        metricName !== prevProps.selectedMetrics[index];
      })
    ) {
      this.setState({ newlySelectedMetrics: this.props.selectedMetrics }, () =>
        this.updateSelection()
      );
    }
  }

  public render(): React.ReactNode {
    const columns: IColumn[] = [
      {
        key: "metricName",
        fieldName: "metricName",
        name: localization.ModelAssessment.ModelOverview.metricConfiguration
          .metricNameColumnHeader,
        minWidth: 100,
        maxWidth: 200
      },
      {
        key: "metricDescription",
        fieldName: "metricDescription",
        name: localization.ModelAssessment.ModelOverview.metricConfiguration
          .metricDescriptionColumnHeader,
        minWidth: 300
      }
    ];

    return (
      <Panel
        isOpen={this.props.isOpen}
        closeButtonAriaLabel="Close"
        onDismiss={this.props.onDismissFlyout}
        onRenderFooterContent={this.onRenderFooterContent}
        isFooterAtBottom={true}
        type={PanelType.medium}
      >
        <Stack tokens={{ childrenGap: "10px" }}>
          <Text variant={"xLarge"}>
            {
              localization.ModelAssessment.ModelOverview.featureConfiguration
                .flyoutHeader
            }
          </Text>
          <Text variant={"large"}>
            {
              localization.ModelAssessment.ModelOverview.featureConfiguration
                .flyoutSubHeader
            }
          </Text>
          <Text>
            {
              localization.ModelAssessment.ModelOverview.featureConfiguration
                .flyoutDescription
            }
          </Text>
          <DetailsList
            items={this.state.items}
            columns={columns}
            selectionMode={SelectionMode.multiple}
            selection={this._selection}
            checkboxVisibility={CheckboxVisibility.always}
          />
        </Stack>
      </Panel>
    );
  }

  private onConfirm = () => {
    this.props.updateSelectedMetrics(this.state.newlySelectedMetrics);
  };

  private onRenderFooterContent = () => {
    const noMetricsSelected = this._selection.getSelectedCount() === 0;
    return (
      <Stack tokens={{ childrenGap: "10px" }}>
        {noMetricsSelected && (
          <MessageBar messageBarType={MessageBarType.error}>
            {
              localization.ModelAssessment.ModelOverview.metricConfiguration
                .noMetricsSelectedWarning
            }
          </MessageBar>
        )}
        <Stack horizontal tokens={{ childrenGap: "10px" }}>
          <PrimaryButton
            onClick={this.onConfirm}
            text={localization.ModelAssessment.ModelOverview.chartConfigConfirm}
            disabled={noMetricsSelected}
          />
          <DefaultButton
            onClick={this.props.onDismissFlyout}
            text={localization.ModelAssessment.ModelOverview.chartConfigCancel}
          />
        </Stack>
      </Stack>
    );
  };

  private updateSelection = () => {
    this._selection.setItems(this.state.items);
    this.state.newlySelectedMetrics.forEach((metricName) => {
      this._selection.setIndexSelected(
        this.props.selectableMetrics.findIndex(
          (selectableMetricName) => selectableMetricName.key === metricName
        ),
        true,
        true
      );
    });
  };

  private getItems(): IMetricConfigurationRow[] {
    return this.props.selectableMetrics.map((metricOption) => {
      return {
        key: metricOption.key.toString(),
        metricName: metricOption.text,
        metricDescription: metricOption.description
      };
    });
  }
}
