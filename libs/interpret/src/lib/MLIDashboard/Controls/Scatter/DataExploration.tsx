import { ComboBox, IComboBox, IComboBoxOption } from "office-ui-fabric-react/lib/ComboBox";
import React from "react";
import { AccessibleChart, IPlotlyProperty } from "@responsible-ai/mlchartlib";
import { localization } from "../../../Localization/localization";
import { FabricStyles } from "../../FabricStyles";
import { ScatterUtils, IScatterProps } from "./ScatterUtils";
import _ from "lodash";
import { NoDataMessage } from "../../SharedComponents";
import "./Scatter.scss";

export const DataScatterId = "data_scatter_id";

export class DataExploration extends React.PureComponent<IScatterProps> {
    private plotlyProps: IPlotlyProperty;

    constructor(props: IScatterProps) {
        super(props);
        this.onXSelected = this.onXSelected.bind(this);
        this.onYSelected = this.onYSelected.bind(this);
        this.onColorSelected = this.onColorSelected.bind(this);
        this.onDismiss = this.onDismiss.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    public render(): React.ReactNode {
        if (this.props.dashboardContext.explanationContext.testDataset) {
            const projectedData = ScatterUtils.projectData(this.props.dashboardContext.explanationContext);
            this.plotlyProps =
                this.props.plotlyProps !== undefined
                    ? _.cloneDeep(this.props.plotlyProps)
                    : ScatterUtils.defaultDataExpPlotlyProps(this.props.dashboardContext.explanationContext);
            const dropdownOptions = ScatterUtils.buildOptions(this.props.dashboardContext.explanationContext, false);
            const initialColorOption = ScatterUtils.getselectedColorOption(this.plotlyProps, dropdownOptions);
            let plotProps = ScatterUtils.populatePlotlyProps(projectedData, _.cloneDeep(this.plotlyProps));
            plotProps = ScatterUtils.updatePropsForSelections(plotProps, this.props.selectedRow);
            return (
                <div className="explanation-chart">
                    <div className="top-controls">
                        <div className="path-selector x-value">
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
                        <div className="path-selector">
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
                    <div className="top-controls">
                        <div className="path-selector y-value">
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
                    </div>
                    <AccessibleChart
                        plotlyProps={plotProps}
                        theme={this.props.theme}
                        onClickHandler={this.handleClick}
                    />
                </div>
            );
        }
        const explanationStrings = this.props.messages ? this.props.messages.TestReq : undefined;
        return <NoDataMessage explanationStrings={explanationStrings} />;
    }

    private handleClick(data: any): void {
        const clickedId = (data.points[0] as any).customdata;
        const selections: string[] = this.props.selectionContext.selectedIds.slice();
        const existingIndex = selections.indexOf(clickedId);
        if (existingIndex !== -1) {
            selections.splice(existingIndex, 1);
        } else {
            selections.push(clickedId);
        }
        this.props.selectionContext.onSelect(selections);
    }

    private onXSelected(_event: React.FormEvent<IComboBox>, item: IComboBoxOption): void {
        ScatterUtils.updateNewXAccessor(this.props, this.plotlyProps, item, DataScatterId);
    }

    private onYSelected(_event: React.FormEvent<IComboBox>, item: IComboBoxOption): void {
        ScatterUtils.updateNewYAccessor(this.props, this.plotlyProps, item, DataScatterId);
    }

    // Color is done in one of two ways: if categorical, we set the groupBy property, creating a series per class
    // If it is numeric, we set the color property and display a colorbar. when setting one, clear the other.
    private onColorSelected(_event: React.FormEvent<IComboBox>, item: IComboBoxOption): void {
        ScatterUtils.updateColorAccessor(this.props, this.plotlyProps, item, DataScatterId);
    }

    private onDismiss(): void {
        this.setState({ isCalloutVisible: false });
    }
}
