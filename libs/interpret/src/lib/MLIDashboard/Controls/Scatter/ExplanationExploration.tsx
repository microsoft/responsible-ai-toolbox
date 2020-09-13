import React from "react";
import {
  Callout,
  DefaultButton,
  IconButton,
  ComboBox,
  IComboBox,
  IComboBoxOption
} from "office-ui-fabric-react";

import { AccessibleChart, IPlotlyProperty } from "@responsible-ai/mlchartlib";

import _ from "lodash";
import { FabricStyles } from "../../FabricStyles";
import { localization } from "../../../Localization/localization";
import { ModelTypes } from "../../IExplanationContext";
import { LoadingSpinner } from "../../SharedComponents/LoadingSpinner";
import { NoDataMessage } from "../../SharedComponents/NoDataMessage";
import { ScatterUtils, IScatterProps } from "./ScatterUtils";
import { scatterStyles } from "./Scatter.styles";

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
          dataset: this.props.dashboardContext.explanationContext.testDataset
            .dataset
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
      const includeWeightDropdown =
        this.props.dashboardContext.explanationContext.modelMetadata
          .modelType === ModelTypes.multiclass;
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
                label={localization.ExplanationScatter.xValue}
                ariaLabel="x picker"
                selectedKey={this.plotlyProps.data[0].xAccessor}
                useComboBoxAsMenuWidth={true}
                styles={FabricStyles.defaultDropdownStyle}
              />
            </div>
            <div>
              <ComboBox
                options={dropdownOptions}
                onChange={this.onColorSelected}
                label={localization.ExplanationScatter.colorValue}
                ariaLabel="color picker"
                selectedKey={initialColorOption}
                useComboBoxAsMenuWidth={true}
                styles={FabricStyles.defaultDropdownStyle}
              />
            </div>
          </div>
          <div className={scatterStyles.topControls}>
            <div>
              <ComboBox
                options={dropdownOptions}
                onChange={this.onYSelected}
                label={localization.ExplanationScatter.yValue}
                ariaLabel="y picker"
                selectedKey={this.plotlyProps.data[0].yAccessor}
                useComboBoxAsMenuWidth={true}
                styles={FabricStyles.defaultDropdownStyle}
              />
            </div>
            {includeWeightDropdown && (
              <div className={scatterStyles.selector}>
                <div className={scatterStyles.selectorLabel}>
                  <div className={scatterStyles.labelText}>
                    {localization.CrossClass.label}
                  </div>
                  <IconButton
                    id={this.iconId}
                    iconProps={{ iconName: "Info" }}
                    title={localization.CrossClass.info}
                    onClick={this.onIconClick}
                    styles={{
                      root: { marginBottom: -3, color: "rgb(0, 120, 212)" }
                    }}
                  />
                </div>
                <ComboBox
                  className={scatterStyles.selectorComboBox}
                  selectedKey={weightContext.selectedKey}
                  onChange={weightContext.onSelection}
                  options={weightContext.options}
                  ariaLabel={"Cross-class weighting selector"}
                  useComboBoxAsMenuWidth={true}
                  styles={FabricStyles.defaultDropdownStyle}
                />
              </div>
            )}
          </div>
          {this.state.isCalloutVisible && (
            <Callout
              target={"#" + this.iconId}
              setInitialFocus={true}
              onDismiss={this.onDismiss}
              role="alertdialog"
            >
              <div className={scatterStyles.calloutInfo}>
                <div>
                  <span>{localization.CrossClass.overviewInfo}</span>
                  <ul>
                    <li>{localization.CrossClass.absoluteValInfo}</li>
                    <li>{localization.CrossClass.predictedClassInfo}</li>
                    <li>{localization.CrossClass.enumeratedClassInfo}</li>
                  </ul>
                </div>
                <DefaultButton
                  onClick={this.onDismiss}
                  className={scatterStyles.calloutButton}
                >
                  {localization.CrossClass.close}
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
    const selections: string[] = this.props.selectionContext.selectedIds.slice();
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
