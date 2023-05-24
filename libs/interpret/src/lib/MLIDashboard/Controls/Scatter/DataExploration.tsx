// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ComboBox, IComboBox, IComboBoxOption } from "@fluentui/react";
import { FluentUIStyles } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { AccessibleChart, IPlotlyProperty } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import React from "react";

import { NoDataMessage } from "../../SharedComponents/NoDataMessage";

import { scatterStyles } from "./Scatter.styles";
import { ScatterUtils, IScatterProps } from "./ScatterUtils";

export const dataScatterId = "data_scatter_id";

export class DataExploration extends React.PureComponent<IScatterProps> {
  private plotlyProps: IPlotlyProperty;
  public constructor(props: IScatterProps) {
    super(props);
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
      this.props.dashboardContext.explanationContext.testDataset.dataset
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
          : ScatterUtils.defaultDataExpPlotlyProps(
              this.props.dashboardContext.explanationContext
            );
      const dropdownOptions = ScatterUtils.buildOptions(
        this.props.dashboardContext.explanationContext,
        false
      );
      const initialColorOption = ScatterUtils.getselectedColorOption(
        this.plotlyProps,
        dropdownOptions
      );
      let plotProps = ScatterUtils.populatePlotlyProps(
        projectedData,
        _.cloneDeep(this.plotlyProps)
      );
      plotProps = ScatterUtils.updatePropsForSelections(
        plotProps,
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
          </div>
          <AccessibleChart
            plotlyProps={plotProps}
            theme={this.props.theme}
            onClickHandler={this.handleClick}
          />
        </div>
      );
    }
    const explanationStrings = this.props.messages
      ? this.props.messages.TestReq
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
        dataScatterId
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
        dataScatterId
      );
    }
  };

  // Color is done in one of two ways: if categorical, we set the groupBy property, creating a series per class
  // If it is numeric, we set the color property and display a colorbar. when setting one, clear the other.
  private onColorSelected = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item) {
      ScatterUtils.updateColorAccessor(
        this.props,
        this.plotlyProps,
        item,
        dataScatterId
      );
    }
  };
}
