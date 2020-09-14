import _ from "lodash";
import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
  IDropdownOption,
  Slider,
  Callout,
  DefaultButton,
  IconButton
} from "office-ui-fabric-react";
import React from "react";
import { localization } from "../../../Localization/localization";
import { FabricStyles } from "../../FabricStyles";
import { ModelTypes, IGlobalExplanation } from "../../IExplanationContext";
import { ModelExplanationUtils } from "../../ModelExplanationUtils";
import {
  FeatureSortingKey,
  FeatureKeys
} from "../../SharedComponents/IBarChartConfig";
import { BarChart } from "../../SharedComponents/BarChart";
import { LoadingSpinner } from "../../SharedComponents/LoadingSpinner";
import { NoDataMessage } from "../../SharedComponents/NoDataMessage";
import { featureImportanceBarStyles } from "./FeatureImportanceBar.styles";
import { IGlobalFeatureImportanceProps } from "./FeatureImportanceWrapper";
import { FeatureImportanceModes } from "./FeatureImportanceModes";

export interface IFeatureImportanceBarState {
  selectedSorting: FeatureSortingKey;
  isCalloutVisible: boolean;
}

export class FeatureImportanceBar extends React.PureComponent<
  IGlobalFeatureImportanceProps,
  IFeatureImportanceBarState
> {
  private sortOptions: IDropdownOption[];
  private readonly _iconId = "icon-id";

  public constructor(props: IGlobalFeatureImportanceProps) {
    super(props);
    this.sortOptions = this.buildSortOptions();
    this.state = {
      selectedSorting: FeatureKeys.AbsoluteGlobal,
      isCalloutVisible: false
    };
  }

  public render(): React.ReactNode {
    const expContext = this.props.dashboardContext.explanationContext;
    const globalExplanation = expContext.globalExplanation;
    if (
      globalExplanation !== undefined &&
      (globalExplanation.flattenedFeatureImportances !== undefined ||
        globalExplanation.perClassFeatureImportances !== undefined)
    ) {
      const featuresByClassMatrix = this.getFeatureByClassMatrix(
        globalExplanation
      );
      const sortVector = this.getSortVector(featuresByClassMatrix);

      return (
        <div className={featureImportanceBarStyles.featureBarExplanationChart}>
          <div className={featureImportanceBarStyles.topControls}>
            {this.props.chartTypeOptions &&
              this.props.chartTypeOptions.length > 1 && (
                <ComboBox
                  label={localization.FeatureImportanceWrapper.chartType}
                  selectedKey={this.props.config.displayMode}
                  onChange={this.setChart}
                  options={this.props.chartTypeOptions}
                  ariaLabel={"chart type picker"}
                  useComboBoxAsMenuWidth={true}
                  styles={FabricStyles.smallDropdownStyle}
                />
              )}
            <div className={featureImportanceBarStyles.sliderControl}>
              <div className={featureImportanceBarStyles.sliderLabel}>
                <span className={featureImportanceBarStyles.labelText}>
                  {localization.AggregateImportance.topKFeatures}
                </span>
                <IconButton
                  id={this._iconId}
                  iconProps={{ iconName: "Info" }}
                  title={localization.AggregateImportance.topKInfo}
                  onClick={this.onIconClick}
                  styles={{
                    root: { marginBottom: -3, color: "rgb(0, 120, 212)" }
                  }}
                />
              </div>
              <Slider
                className={featureImportanceBarStyles.featureSlider}
                max={Math.min(30, expContext.modelMetadata.featureNames.length)}
                min={1}
                step={1}
                value={this.props.config.topK}
                onChange={this.setTopK}
                showValue={true}
                ariaLabel={localization.AggregateImportance.topKFeatures}
              />
            </div>
            {this.sortOptions.length > 0 && (
              <ComboBox
                label={localization.BarChart.sortBy}
                selectedKey={this.state.selectedSorting}
                onChange={this.onSortSelect}
                options={this.sortOptions}
                ariaLabel={"sort selector"}
                useComboBoxAsMenuWidth={true}
                styles={FabricStyles.smallDropdownStyle}
              />
            )}
          </div>
          {this.state.isCalloutVisible && (
            <Callout
              target={"#" + this._iconId}
              setInitialFocus={true}
              onDismiss={this.onDismiss}
              role="alertdialog"
            >
              <div className={featureImportanceBarStyles.calloutInfo}>
                <div>
                  <span>{localization.CrossClass.overviewInfo}</span>
                  <ul>
                    <li>{localization.CrossClass.absoluteValInfo}</li>
                    <li>{localization.CrossClass.predictedClassInfo}</li>
                    <li>{localization.CrossClass.enumeratedClassInfo}</li>
                  </ul>
                </div>
                <DefaultButton onClick={this.onDismiss}>
                  {localization.CrossClass.close}
                </DefaultButton>
              </div>
            </Callout>
          )}
          <BarChart
            theme={this.props.theme}
            intercept={
              this.props.dashboardContext.explanationContext.globalExplanation
                ?.intercepts
            }
            featureByClassMatrix={featuresByClassMatrix}
            sortedIndexVector={sortVector}
            topK={this.props.config.topK}
            modelMetadata={expContext.modelMetadata}
            barmode="stack"
          />
        </div>
      );
    }
    if (
      expContext.localExplanation &&
      expContext.localExplanation.percentComplete !== undefined
    ) {
      return <LoadingSpinner />;
    }

    const explanationStrings = this.props.messages
      ? this.props.messages.LocalOrGlobalAndTestReq
      : undefined;
    return <NoDataMessage explanationStrings={explanationStrings} />;
  }

  private getSortVector = (featureByClassMatrix: number[][]): number[] => {
    if (this.state.selectedSorting === FeatureKeys.AbsoluteGlobal) {
      return ModelExplanationUtils.buildSortedVector(featureByClassMatrix);
    }
    return ModelExplanationUtils.buildSortedVector(
      featureByClassMatrix,
      this.state.selectedSorting as number
    );
  };

  private getFeatureByClassMatrix = (
    globalExplanation: IGlobalExplanation
  ): number[][] => {
    return (
      globalExplanation.perClassFeatureImportances ||
      globalExplanation.flattenedFeatureImportances?.map((value) => [value]) ||
      []
    );
  };

  private buildSortOptions = (): IDropdownOption[] => {
    if (
      this.props.dashboardContext.explanationContext.modelMetadata.modelType !==
        ModelTypes.Multiclass ||
      this.props.dashboardContext.explanationContext.globalExplanation ===
        undefined ||
      this.props.dashboardContext.explanationContext.globalExplanation
        .perClassFeatureImportances === undefined
    ) {
      return [];
    }
    const result: IDropdownOption[] = [
      {
        key: FeatureKeys.AbsoluteGlobal,
        text: localization.BarChart.absoluteGlobal
      }
    ];
    result.push(
      ...this.props.dashboardContext.explanationContext.modelMetadata.classNames.map(
        (className, index) => ({
          key: index,
          text: className
        })
      )
    );
    return result;
  };

  private setTopK = (newValue: number): void => {
    const newConfig = _.cloneDeep(this.props.config);
    newConfig.topK = newValue;
    this.props.onChange(newConfig, this.props.config.id);
  };

  private setChart = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item?.key !== undefined) {
      const newConfig = _.cloneDeep(this.props.config);
      newConfig.displayMode = item.key as FeatureImportanceModes;
      this.props.onChange(newConfig, this.props.config.id);
    }
  };

  private onSortSelect = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item?.key !== undefined) {
      this.setState({ selectedSorting: item.key as FeatureSortingKey });
    }
  };

  private onIconClick = (): void => {
    this.setState({ isCalloutVisible: !this.state.isCalloutVisible });
  };

  private onDismiss = (): void => {
    this.setState({ isCalloutVisible: false });
  };
}
