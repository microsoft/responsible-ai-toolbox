// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IComboBox,
  ComboBox,
  Callout,
  DefaultButton,
  IconButton
} from "@fluentui/react";
import { FluentUIStyles, IsClassifier } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { AccessibleChart, IPlotlyProperty } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import React from "react";

import { LoadingSpinner } from "../../SharedComponents/LoadingSpinner";
import { NoDataMessage } from "../../SharedComponents/NoDataMessage";

import { scatterStyles } from "./Scatter.styles";
import { ScatterUtils, IScatterProps } from "./ScatterUtils";

export const explanationScatterId = "explanation_scatter_id";

export interface IExplanationExplorationState {
  isCalloutVisible: boolean;
}

export class ExplanationExploration extends React.PureComponent<
  IScatterProps,
  IExplanationExplorationState
> {
  private readonly iconId = "data-exploration-help-icon1";
  private plotlyProps: IPlotlyProperty;

  public constructor(props: IScatterProps) {
    super(props);
    this.state = { isCalloutVisible: false };
    this.plotlyProps =
      this.props.plotlyProps !== undefined
        ? _.cloneDeep(this.props.plotlyProps)
        : ScatterUtils.defaultExplanationPlotlyProps(
            this.props.dashboardContext.explanationContext
          );
  }

  public render(): React.ReactNode {
    if (
      this.props.dashboardContext.explanationContext.testDataset &&
      this.props.dashboardContext.explanationContext.testDataset.dataset &&
      this.props.dashboardContext.explanationContext.localExplanation &&
      this.props.dashboardContext.explanationContext.localExplanation.values
    ) {
      const projectedData = ScatterUtils.projectData({
        ...this.props.dashboardContext.explanationContext,
        testDataset: {
          ...this.props.dashboardContext.explanationContext.testDataset,
          dataset:
            this.props.dashboardContext.explanationContext.testDataset.dataset
        }
      });
      this.plotlyProps =
        this.props.plotlyProps !== undefined
          ? _.cloneDeep(this.props.plotlyProps)
          : ScatterUtils.defaultExplanationPlotlyProps(
              this.props.dashboardContext.explanationContext
            );
      const dropdownOptions = ScatterUtils.buildOptions(
        this.props.dashboardContext.explanationContext,
        true
      );
      const initialColorOption = ScatterUtils.getselectedColorOption(
        this.plotlyProps,
        dropdownOptions
      );
      const weightContext = this.props.dashboardContext.weightContext;
      const modelType =
        this.props.dashboardContext.explanationContext.modelMetadata.modelType;
      const includeWeightDropdown = IsClassifier(modelType);
      let plotProp = ScatterUtils.populatePlotlyProps(
        projectedData,
        _.cloneDeep(this.plotlyProps)
      );
      plotProp = ScatterUtils.updatePropsForSelections(
        plotProp,
        this.props.selectedRow
      );
      return (
        <div className={scatterStyles.explanationChart}>
          <div className={scatterStyles.topControls}>
            <div>
              <ComboBox
                options={dropdownOptions}
                onChange={this.onXSelected}
                label={localization.Interpret.ExplanationScatter.xValue}
                ariaLabel="x picker"
                selectedKey={this.plotlyProps.data[0].xAccessor}
                useComboBoxAsMenuWidth
                styles={FluentUIStyles.defaultDropdownStyle}
              />
            </div>
            <div>
              <ComboBox
                options={dropdownOptions}
                onChange={this.onColorSelected}
                label={localization.Interpret.ExplanationScatter.colorValue}
                ariaLabel="color picker"
                selectedKey={initialColorOption}
                useComboBoxAsMenuWidth
                styles={FluentUIStyles.defaultDropdownStyle}
              />
            </div>
          </div>
          <div className={scatterStyles.topControls}>
            <div>
              <ComboBox
                options={dropdownOptions}
                onChange={this.onYSelected}
                label={localization.Interpret.ExplanationScatter.yValue}
                ariaLabel="y picker"
                selectedKey={this.plotlyProps.data[0].yAccessor}
                useComboBoxAsMenuWidth
                styles={FluentUIStyles.defaultDropdownStyle}
              />
            </div>
            {includeWeightDropdown && (
              <div className={scatterStyles.selector}>
                <div className={scatterStyles.selectorLabel}>
                  <div className={scatterStyles.labelText}>
                    {localization.Interpret.CrossClass.label}
                  </div>
                  <IconButton
                    id={this.iconId}
                    iconProps={{ iconName: "Info" }}
                    title={localization.Interpret.CrossClass.info}
                    onClick={this.onIconClick}
                    styles={{
                      root: { color: "rgb(0, 120, 212)", marginBottom: -3 }
                    }}
                  />
                </div>
                <ComboBox
                  className={scatterStyles.selectorComboBox}
                  selectedKey={weightContext.selectedKey}
                  onChange={weightContext.onSelection}
                  options={weightContext.options}
                  ariaLabel={"Cross-class weighting selector"}
                  useComboBoxAsMenuWidth
                  styles={FluentUIStyles.defaultDropdownStyle}
                />
              </div>
            )}
          </div>
          {this.state.isCalloutVisible && (
            <Callout
              target={`#${this.iconId}`}
              setInitialFocus
              onDismiss={this.onDismiss}
              role="alertdialog"
            >
              <div className={scatterStyles.calloutInfo}>
                <div>
                  <span>{localization.Interpret.CrossClass.overviewInfo}</span>
                  <ul>
                    <li>{localization.Interpret.CrossClass.absoluteValInfo}</li>
                    <li>
                      {localization.Interpret.CrossClass.predictedClassInfo}
                    </li>
                    <li>
                      {localization.Interpret.CrossClass.enumeratedClassInfo}
                    </li>
                  </ul>
                </div>
                <DefaultButton
                  onClick={this.onDismiss}
                  className={scatterStyles.calloutButton}
                >
                  {localization.Interpret.CrossClass.close}
                </DefaultButton>
              </div>
            </Callout>
          )}
          <AccessibleChart
            plotlyProps={plotProp}
            theme={this.props.theme}
            onClickHandler={this.handleClick}
          />
        </div>
      );
    }
    if (
      this.props.dashboardContext.explanationContext.localExplanation &&
      this.props.dashboardContext.explanationContext.localExplanation
        .percentComplete !== undefined
    ) {
      return <LoadingSpinner />;
    }
    const explanationStrings = this.props.messages
      ? this.props.messages.LocalExpAndTestReq
      : undefined;
    return <NoDataMessage explanationStrings={explanationStrings} />;
  }

  private handleClick = (data: any): void => {
    const clickedId = (data.points[0] as any).customdata;
    const selections: string[] =
      this.props.selectionContext.selectedIds.slice();
    const existingIndex = selections.indexOf(clickedId);
    if (existingIndex !== -1) {
      selections.splice(existingIndex, 1);
    } else {
      selections.push(clickedId);
    }
    this.props.selectionContext.onSelect(selections);
  };

  private onXSelected = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item) {
      ScatterUtils.updateNewXAccessor(
        this.props,
        this.plotlyProps,
        item,
        explanationScatterId
      );
    }
  };

  private onYSelected = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item) {
      ScatterUtils.updateNewYAccessor(
        this.props,
        this.plotlyProps,
        item,
        explanationScatterId
      );
    }
  };

  // Color is done in one of two ways: if categorical, we set the groupBy property, creating a series per class
  // If it is numeric, we set the color property and display a color bar. when setting one, clear the other.
  private onColorSelected = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item) {
      ScatterUtils.updateColorAccessor(
        this.props,
        this.plotlyProps,
        item,
        explanationScatterId
      );
    }
  };

  private onIconClick = (): void => {
    this.setState({ isCalloutVisible: !this.state.isCalloutVisible });
  };

  private onDismiss = (): void => {
    this.setState({ isCalloutVisible: false });
  };
}
