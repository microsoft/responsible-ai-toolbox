import _ from "lodash";
import { RangeTypes } from "mlchartlib";
import { Text } from "office-ui-fabric-react";
import { PrimaryButton } from "office-ui-fabric-react/lib/Button";
import { Callout, Target, DirectionalHint } from "office-ui-fabric-react/lib/Callout";
import { Checkbox } from "office-ui-fabric-react/lib/Checkbox";
import { ComboBox, IComboBox, IComboBoxOption } from "office-ui-fabric-react/lib/ComboBox";
import { DetailsList, Selection, SelectionMode, CheckboxVisibility } from "office-ui-fabric-react/lib/DetailsList";
import { SpinButton } from "office-ui-fabric-react/lib/SpinButton";
import { Position } from "office-ui-fabric-react/lib/utilities/positioning";
import React from "react";
import { localization } from "../../../Localization/localization";
import { Cohort } from "../../Cohort";
import { ColumnCategories, IJointMeta, JointDataset } from "../../JointDataset";
import { ISelectorConfig } from "../../ErrorAnalysisDashboard";
import { axisControlCallout, axisControlDialogStyles } from "./AxisConfigDialog.styles";

const styles = axisControlDialogStyles();

export interface IAxisConfigProps {
    jointDataset: JointDataset;
    orderedGroupTitles: ColumnCategories[];
    selectedColumn: ISelectorConfig;
    canBin: boolean;
    mustBin: boolean;
    canDither: boolean;
    onAccept: (newConfig: ISelectorConfig) => void;
    onCancel: () => void;
    target: Target;
}

export interface IAxisConfigState {
    selectedColumn: ISelectorConfig;
    binCount?: number;
}

export class AxisConfigDialog extends React.PureComponent<IAxisConfigProps, IAxisConfigState> {
    private _isInitialized = false;

    private _leftSelection: Selection;
    private static readonly MIN_HIST_COLS = 2;
    private static readonly MAX_HIST_COLS = 40;
    private static readonly DEFAULT_BIN_COUNT = 5;

    private readonly leftItems= [
        Cohort.CohortKey,
        JointDataset.IndexLabel,
        JointDataset.DataLabelRoot,
        JointDataset.PredictedYLabel,
        JointDataset.TrueYLabel,
        JointDataset.ClassificationError,
        JointDataset.RegressionError,
        JointDataset.ProbabilityYRoot + "0"
    ].map(key => {
        const metaVal = this.props.jointDataset.metaDict[key];
        if (key === JointDataset.DataLabelRoot && this.props.orderedGroupTitles.includes(ColumnCategories.dataset)) {
            return {key, title: localization.Columns.dataset};
        }
        if  (metaVal === undefined || !this.props.orderedGroupTitles.includes(metaVal.category)) {
            return undefined;
        }

        return {key, title: metaVal.abbridgedLabel};
    }).filter(obj => obj !== undefined);

    private readonly dataArray: IComboBoxOption[] = new Array(this.props.jointDataset.datasetFeatureCount).fill(0)
        .map((unused, index) => {
            const key = JointDataset.DataLabelRoot + index.toString();
            return {key, text: this.props.jointDataset.metaDict[key].abbridgedLabel};
        });

    constructor(props: IAxisConfigProps) {
        super(props);
        this.state = {
            selectedColumn: _.cloneDeep(this.props.selectedColumn),
            binCount: this._getBinCountForProperty(this.props.selectedColumn.property)
        };
        this._leftSelection = new Selection({
            selectionMode: SelectionMode.single,
            onSelectionChanged: this._setSelection
          });
        this._leftSelection.setItems(this.leftItems);
        this._leftSelection.setKeySelected(this.extractSelectionKey(this.props.selectedColumn.property), true, false);
        this._isInitialized = true;
    }

    public render(): React.ReactNode {
        const selectedMeta = this.props.jointDataset.metaDict[this.state.selectedColumn.property];
        const isDataColumn = this.state.selectedColumn.property.indexOf(JointDataset.DataLabelRoot) !== -1;
        var minVal, maxVal;

        return (
            <Callout
                onDismiss={this.props.onCancel}
                setInitialFocus={true}
                hidden={false}
                styles = {axisControlCallout}
            >
                <div className={styles.wrapper}>
                    <div className={styles.leftHalf}>
                        <DetailsList
                            className={styles.detailedList}
                            items={this.leftItems}
                            ariaLabelForSelectionColumn="Toggle selection"
                            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                            checkButtonAriaLabel="Row checkbox"
                            onRenderDetailsHeader={this._onRenderDetailsHeader}
                            checkboxVisibility={CheckboxVisibility.hidden}
                            selection={this._leftSelection}
                            selectionPreservedOnEmptyClick={true}
                            setKey={"set"}
                            columns={[{key: 'col1', name: 'name', minWidth: 200, fieldName: 'title'}]}
                        />
                    </div>
                    {this.state.selectedColumn.property === Cohort.CohortKey && (
                            <div className={styles.rightHalf}>Group by cohort</div>
                    )}
                    {this.state.selectedColumn.property !== Cohort.CohortKey &&
                    (<div className={styles.rightHalf}>
                        {isDataColumn && (
                            <ComboBox
                                options={this.dataArray}
                                onChange={this.setSelectedProperty}
                                label={localization.AxisConfigDialog.selectFeature}
                                className={styles.featureComboBox}
                                selectedKey={this.state.selectedColumn.property}
                            />
                        )}
                        {selectedMeta.featureRange && selectedMeta.featureRange.rangeType === RangeTypes.integer && (
                            <Checkbox  
                            className = {styles.treatCategorical}
                            label={localization.AxisConfigDialog.TreatAsCategorical} 
                            checked={selectedMeta.treatAsCategorical} 
                            onChange={this.setAsCategorical} />
                        )}
                        {selectedMeta.treatAsCategorical && (
                            <div>
                                <Text variant={"small"} className={styles.featureText}>
                                {`${localization.formatString(localization.Filters.uniqueValues,selectedMeta.sortedCategoricalValues.length)}`}
                                </Text>
                                {this.props.canDither && (
                                    <Checkbox 
                                        label ={localization.AxisConfigDialog.ditherLabel}
                                        checked={this.state.selectedColumn.options.dither}
                                        onChange={this.ditherChecked}
                                    />
                                )}
                            </div>
                        )}
                        {!selectedMeta.treatAsCategorical && (
                            <div>
                                <Text variant={"small"} className={styles.featureText} nowrap block>
                                    { minVal = (selectedMeta.featureRange.min % 1) != 0 ? (Math.round(selectedMeta.featureRange.min * 10000) / 10000).toFixed(4): selectedMeta.featureRange.min }
                                    { maxVal = (selectedMeta.featureRange.max % 1) != 0 ? (Math.round(selectedMeta.featureRange.max * 10000) / 10000).toFixed(4): selectedMeta.featureRange.max }
                                    {`${localization.formatString(localization.Filters.min,minVal)}${localization.formatString(localization.Filters.max,maxVal)}`}
                               </Text>
                                {this.props.canBin && !this.props.mustBin && (
                                    <Checkbox
                                        label={localization.AxisConfigDialog.binLabel}
                                        checked={this.state.selectedColumn.options.bin}
                                        onChange={this.shouldBinClicked}
                                    />
                                )}
                                {(this.props.mustBin || this.state.selectedColumn.options.bin) && this.state.binCount !== undefined && (
                                <SpinButton
                                    className={styles.spinButton}
                                    labelPosition={Position.top}
                                    label={localization.AxisConfigDialog.numOfBins}
                                    min={AxisConfigDialog.MIN_HIST_COLS}
                                    max={AxisConfigDialog.MAX_HIST_COLS}
                                    value={this.state.binCount.toString()}
                                    onIncrement={this.setNumericValue.bind(this, 1, selectedMeta)}
                                    onDecrement={this.setNumericValue.bind(this, -1, selectedMeta)}
                                    onValidate={this.setNumericValue.bind(this, 0, selectedMeta)}
                                />
                                )}
                            </div>
                        )}
                    </div>)}
                </div>
                <PrimaryButton 
                    text={localization.AxisConfigDialog.select}
                    onClick={this.saveState}
                    className={styles.selectButton}
                />
                
            </Callout>
        );
    }

    private extractSelectionKey(key: string): string {
        let index = key.indexOf(JointDataset.DataLabelRoot);
        if (index !== -1) {
            return JointDataset.DataLabelRoot;
        }
        return key;
    }

    private readonly setAsCategorical = (ev: React.FormEvent<HTMLElement>, checked: boolean): void => {
        this.props.jointDataset.setTreatAsCategorical(this.state.selectedColumn.property, checked);
        this.forceUpdate();
    }

    private readonly shouldBinClicked = (ev: React.FormEvent<HTMLElement>, checked: boolean): void => {
        const property = this.state.selectedColumn.property;
        if (checked === false) {
            this.setState({selectedColumn: {
                property,
                options: {
                    bin: checked
                }
            }});
        } else {
            const binCount = this._getBinCountForProperty(property);
            this.setState({selectedColumn: {
                property,
                options: {
                    bin: checked
                }
            }, binCount});
        }
    }

    private readonly saveState = (): void => {
        if (this.state.binCount) {
            this.props.jointDataset.addBin(this.state.selectedColumn.property, this.state.binCount);
        }
        this.props.onAccept(this.state.selectedColumn);
    }

    private readonly _onRenderDetailsHeader = () => {
        return <div className={styles.filterHeader}>{localization.AxisConfigDialog.selectFilter}</div>
    }

    private readonly ditherChecked = (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean): void => {
        this.setState({
            selectedColumn: {
                property: this.state.selectedColumn.property,
                options: {
                    dither: checked
                }
            }
        })
    }

    private readonly setNumericValue = (delta: number, column: IJointMeta, stringVal: string): string | void => {
        if (delta === 0) {
            const number = +stringVal;
            if (!Number.isInteger(number) || number > AxisConfigDialog.MAX_HIST_COLS || number < AxisConfigDialog.MIN_HIST_COLS) {
                return this.state.binCount.toString();
            }
            this.setState({binCount: number});
        } else {
            const prevVal = this.state.binCount as number;
            const newVal = prevVal + delta;
            if (newVal > AxisConfigDialog.MAX_HIST_COLS || newVal < AxisConfigDialog.MIN_HIST_COLS) {
                return prevVal.toString();
            }
            this.setState({binCount: newVal});
        }
    }

    private setDefaultStateForKey(property: string): void {
        const dither = this.props.canDither && this.props.jointDataset.metaDict[property].treatAsCategorical;
        const binCount = this._getBinCountForProperty(property);
        this.setState({selectedColumn: {
            property,
            options: {
                dither
            }
        }, binCount});
    }

    private readonly _setSelection = (): void => {
        if (!this._isInitialized) {
            return;
        }
        let property = this._leftSelection.getSelection()[0].key as string;
        if (property === JointDataset.DataLabelRoot) {
            property += "0";
        }
        this.setDefaultStateForKey(property);
    }

    private readonly setSelectedProperty = (event: React.FormEvent<IComboBox>, item: IComboBoxOption): void => {
        const property = item.key as string;
        this.setDefaultStateForKey(property);
    }

    private _getBinCountForProperty(key: string): number | undefined {
        const selectedMeta = this.props.jointDataset.metaDict[key];
        let binCount = undefined;
        if (this.props.canBin && selectedMeta.isCategorical === false) {
            binCount = selectedMeta.sortedCategoricalValues !== undefined ?
                selectedMeta.sortedCategoricalValues.length : AxisConfigDialog.DEFAULT_BIN_COUNT;
        }
        return binCount;
    }
}