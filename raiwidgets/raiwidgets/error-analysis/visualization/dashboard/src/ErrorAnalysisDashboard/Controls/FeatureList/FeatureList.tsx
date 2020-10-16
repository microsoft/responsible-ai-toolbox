import _ from "lodash";
import { featureListStyles } from "./FeatureList.styles";
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { SearchBox, ISearchBoxStyles } from 'office-ui-fabric-react/lib/SearchBox';
import { Stack, IStackStyles, IStackTokens, IStackItemStyles } from 'office-ui-fabric-react/lib/Stack';
import { IFocusTrapZoneProps } from 'office-ui-fabric-react/lib/FocusTrapZone';
import { ILinkStyles, Link } from 'office-ui-fabric-react/lib/Link';
import { viewTypeKeys } from "../../ErrorAnalysisDashboard";
import { Panel } from 'office-ui-fabric-react/lib/Panel';
import { getId } from 'office-ui-fabric-react/lib/utilities';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { PrimaryButton } from 'office-ui-fabric-react';
import React from "react";

export interface IFeatureListProps {
    isOpen: boolean;
    onDismiss: () => void
    saveFeatures: (features: string[]) => void
}

const focusTrapZoneProps: IFocusTrapZoneProps = {
    isClickableOutsideFocusTrap: true,
    forceFocusInsideTrap: false,
};

const searchBoxStyles: Partial<ISearchBoxStyles> = { root: { width: 120 } };

// Used to add spacing between example checkboxes
const checkboxStackTokens: IStackTokens = {
    childrenGap: 's1',
    padding: 'm',
};

const paneStackTokens: IStackTokens = {
    childrenGap: 5,
    padding: 10,
};

export interface IFeatureListProps {
    theme?: string;
    features: string[];
}

export interface IFeatureListState {
    features: string[];
}

export class FeatureList extends React.PureComponent<IFeatureListProps, IFeatureListState> {
    constructor(props: IFeatureListProps) {
        super(props);
        this.state = {
            features: this.props.features
        }
    }

    public render(): React.ReactNode {
        let classNames = featureListStyles();
        return (
            <Panel 
                headerText="Feature List"
                isOpen={this.props.isOpen}
                focusTrapZoneProps={focusTrapZoneProps}
                // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
                closeButtonAriaLabel="Close"
                // layerProps={{ hostId: this.props.hostId }}
                isBlocking={false}
                onDismiss={this.props.onDismiss}
            >
                <div className="featuresSelector">
                    <Stack tokens={checkboxStackTokens} verticalAlign="space-around">
                        <Stack.Item key="decisionTreeKey" align="start">
                            <Text key="decisionTreeTextKey" className="decisionTree">Decision Tree</Text>
                        </Stack.Item>
                        <Stack.Item key="searchKey" align="start">
                            <SearchBox placeholder="Search" styles={searchBoxStyles}
                                onSearch={this._onSearch.bind(this)}
                                onClear={this._onSearch.bind(this)}
                                onChange={(_, newValue) => this._onSearch.bind(this)(newValue)}
                            />
                        </Stack.Item>
                        {this.props.features.map(feature => (
                            <Stack.Item key={"checkboxKey" + feature} align="start">
                                <Checkbox label={feature} checked={this.state.features.includes(feature)} onChange={this._onChange.bind(this, feature)} />
                            </Stack.Item>
                        ))}
                        <Stack.Item key="applyButtonKey" align="start">
                            <PrimaryButton text="Apply" onClick={this._apply.bind(this)} allowDisabledFocus disabled={false} checked={false} />
                        </Stack.Item>
                    </Stack>
                </div>
            </Panel>
        );
    }

    public _onChange(feature: string, ev: React.FormEvent<HTMLElement>, isChecked: boolean) {
        if (isChecked) {
            if (!this.state.features.includes(feature)) {
                this.setState({features: [...this.state.features.concat([feature])]})
            }
        } else {
            this.setState({features: [...this.state.features.filter(stateFeature => stateFeature != feature)]})
        }
    }

    public _onSearch(searchValue: string) {
        this.setState({features: this.props.features.filter(feature => feature.includes(searchValue))})
    }

    public _apply(): void {
        this.props.saveFeatures(this.state.features)
    }
}