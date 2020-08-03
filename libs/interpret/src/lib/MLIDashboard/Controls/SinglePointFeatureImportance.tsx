import React from "react";
import { IDropdownOption, Slider, ComboBox, IComboBox, IComboBoxOption } from "office-ui-fabric-react";
import _ from "lodash";

import { IExplanationContext, ModelTypes } from "../IExplanationContext";
import { IBarChartConfig, FeatureKeys, FeatureSortingKey } from "../SharedComponents/IBarChartConfig";
import { localization } from "../../Localization/localization";
import { ModelExplanationUtils } from "../ModelExplanationUtils";
import { BarChart, PredictionLabel, LoadingSpinner, NoDataMessage } from "../SharedComponents";
import { FabricStyles } from "../FabricStyles";
import { HelpMessageDict } from "../Interfaces";

import "./SinglePointFeatureImportance.scss";

export const LocalBarId = "local_bar_id";

export interface ISinglePointFeatureImportanceProps {
    explanationContext: IExplanationContext;
    selectedRow: number;
    config: IBarChartConfig;
    theme?: string;
    messages?: HelpMessageDict;
    onChange: (config: IBarChartConfig, id: string) => void;
}

export interface ISinglePointFeatureImportanceState {
    selectedSorting: FeatureSortingKey;
}

export class SinglePointFeatureImportance extends React.PureComponent<
    ISinglePointFeatureImportanceProps,
    ISinglePointFeatureImportanceState
> {
    private sortOptions: IDropdownOption[];

    constructor(props: ISinglePointFeatureImportanceProps) {
        super(props);
        this.sortOptions = this.buildSortOptions();
        this.onSortSelect = this.onSortSelect.bind(this);
        this.setTopK = this.setTopK.bind(this);
        this.state = {
            selectedSorting: this.getDefaultSorting(),
        };
    }

    public render(): React.ReactNode {
        const localExplanation = this.props.explanationContext.localExplanation;
        if (localExplanation !== undefined && localExplanation.values !== undefined) {
            const featuresByClassMatrix = this.getFeatureByClassMatrix();
            const sortVector = this.getSortVector();
            const defaultVisibleClasses: number[] =
                this.state.selectedSorting !== FeatureKeys.absoluteGlobal &&
                this.state.selectedSorting !== FeatureKeys.absoluteLocal
                    ? [this.state.selectedSorting]
                    : undefined;
            return (
                <div className="local-summary">
                    {this.props.explanationContext.testDataset &&
                        this.props.explanationContext.testDataset.predictedY && (
                            <PredictionLabel
                                prediction={
                                    this.props.explanationContext.testDataset.predictedY[this.props.selectedRow]
                                }
                                classNames={this.props.explanationContext.modelMetadata.classNames}
                                modelType={this.props.explanationContext.modelMetadata.modelType}
                                predictedProbabilities={
                                    this.props.explanationContext.testDataset.probabilityY
                                        ? this.props.explanationContext.testDataset.probabilityY[this.props.selectedRow]
                                        : undefined
                                }
                            />
                        )}
                    <div className="feature-bar-explanation-chart">
                        <div className="top-controls">
                            <Slider
                                className="feature-slider"
                                label={localization.AggregateImportance.topKFeatures}
                                max={Math.min(30, this.props.explanationContext.modelMetadata.featureNames.length)}
                                min={1}
                                step={1}
                                value={this.props.config.topK}
                                onChange={this.setTopK}
                                showValue={true}
                            />
                            {this.sortOptions.length > 1 && (
                                <ComboBox
                                    className="pathSelector"
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
                        <BarChart
                            intercept={this.props.explanationContext.localExplanation.intercepts}
                            featureByClassMatrix={featuresByClassMatrix}
                            sortedIndexVector={sortVector}
                            topK={this.props.config.topK}
                            modelMetadata={this.props.explanationContext.modelMetadata}
                            additionalRowData={
                                this.props.explanationContext.testDataset.dataset !== undefined
                                    ? this.props.explanationContext.testDataset.dataset[this.props.selectedRow]
                                    : undefined
                            }
                            barmode="group"
                            defaultVisibleClasses={defaultVisibleClasses}
                            theme={this.props.theme}
                        />
                    </div>
                </div>
            );
        }
        if (localExplanation !== undefined && localExplanation.percentComplete !== undefined) {
            return <LoadingSpinner />;
        }
        const explanationStrings = this.props.messages ? this.props.messages.LocalExpAndTestReq : undefined;
        return <NoDataMessage explanationStrings={explanationStrings} />;
    }

    private getSortVector(): number[] {
        const localExplanation = this.props.explanationContext.localExplanation;
        if (this.state.selectedSorting === FeatureKeys.absoluteGlobal) {
            return ModelExplanationUtils.buildSortedVector(
                this.props.explanationContext.globalExplanation.perClassFeatureImportances,
            );
        } else if (this.state.selectedSorting === FeatureKeys.absoluteLocal) {
            return ModelExplanationUtils.buildSortedVector(localExplanation.values[this.props.selectedRow]);
        } else {
            return ModelExplanationUtils.buildSortedVector(
                localExplanation.values[this.props.selectedRow],
                this.state.selectedSorting,
            );
        }
    }

    private getFeatureByClassMatrix(): number[][] {
        const result = this.props.explanationContext.localExplanation.values[this.props.selectedRow];
        // Binary classifier just has feature importance for class 0 stored, class one is equal and oposite.
        if (
            this.props.explanationContext.modelMetadata.modelType === ModelTypes.binary &&
            this.props.explanationContext.testDataset.predictedY !== undefined &&
            this.props.explanationContext.testDataset.predictedY[this.props.selectedRow] !== 0
        ) {
            return result.map(classVector => classVector.map(value => -1 * value));
        }
        return result;
    }

    private buildSortOptions(): IDropdownOption[] {
        const result: IDropdownOption[] = [
            { key: FeatureKeys.absoluteGlobal, text: localization.BarChart.absoluteGlobal },
        ];
        // if (!this.props.explanationContext.testDataset.predictedY) {
        //     return result;
        // }
        if (this.props.explanationContext.modelMetadata.modelType !== ModelTypes.multiclass) {
            result.push({ key: FeatureKeys.absoluteLocal, text: localization.BarChart.absoluteLocal });
        }
        if (this.props.explanationContext.modelMetadata.modelType === ModelTypes.multiclass) {
            result.push(
                ...this.props.explanationContext.modelMetadata.classNames.map((className, index) => ({
                    key: index,
                    text: className,
                })),
            );
        }
        return result;
    }

    private getDefaultSorting(): FeatureSortingKey {
        if (!this.props.explanationContext.testDataset.predictedY) {
            return FeatureKeys.absoluteGlobal;
        }
        return this.props.explanationContext.modelMetadata.modelType === ModelTypes.multiclass
            ? this.props.explanationContext.testDataset.predictedY[this.props.selectedRow]
            : FeatureKeys.absoluteLocal;
    }

    private setTopK(newValue: number): void {
        const newConfig = _.cloneDeep(this.props.config);
        newConfig.topK = newValue;
        this.props.onChange(newConfig, LocalBarId);
    }

    private onSortSelect(_event: React.FormEvent<IComboBox>, item: IComboBoxOption): void {
        this.setState({ selectedSorting: item.key as any });
    }
}
