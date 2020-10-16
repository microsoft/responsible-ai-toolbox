import _ from "lodash";
import { IIconProps, PrimaryButton, IButtonStyles } from "office-ui-fabric-react";
import { ILabelStyles, Label } from 'office-ui-fabric-react/lib/Label';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { mainMenuStyles } from "./MainMenu.styles";
import { Dropdown, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { viewTypeKeys } from "../../ErrorAnalysisDashboard";
import React from "react";


export interface IMainMenuProps {
    viewExplanation: () => void;
    viewType: viewTypeKeys;
    onInfoPanelClick: () => void;
    onSettingsPanelClick: () => void;
    onFeatureListClick: () => void;
    localUrl: string;
}

const settingsIcon: IIconProps = { iconName: 'Settings' };
const infoIcon: IIconProps = { iconName: 'AnalyticsReport' };
const featureListIcon: IIconProps = { iconName: 'MultiSelectMirrored' };
const fullscreenIcon: IIconProps = { iconName: 'ScaleVolume' };

const errorAnalysisOptions: IDropdownOption[] = [
    { key: 'treeMap', text: 'Tree Map' },
    { key: 'heatMap', text: 'Heat Map' }
];
const dropdownStyles: Partial<IDropdownStyles> = {
    root: { alignSelf: 'center' },
    dropdown: { width: 200 }
};
const buttonStyle: IButtonStyles = {
    root: { padding: '0px 4px' }
}
const labelStyle: ILabelStyles = {
    root: { padding: '0px 10px 0px 0px', alignSelf: 'center' }
}
const explanationButtonStyle: IButtonStyles = {
    root: { padding: '0px 4px', alignSelf: 'center' },
}

export class MainMenu extends React.PureComponent<IMainMenuProps> {
    public render(): React.ReactNode {
        let items: ICommandBarItemProps[] = []
        if (this.props.viewType == viewTypeKeys.errorAnalysisView) {
            items = [
                {
                    key: 'errorDetectorLabel',
                    text: 'Error Detector Label',
                    commandBarButtonAs: () => (<Label styles={labelStyle}>Error Detector:</Label>)
                },
                {
                    key: 'errorDetector',
                    text: 'Error Detector',
                    commandBarButtonAs: () => (<Dropdown
                        placeholder="Select error detector"
                        defaultSelectedKey="treeMap"
                        options={errorAnalysisOptions}
                        styles={dropdownStyles}
                      />)
                }
            ];
        } else {
            items = [
                {
                    key: 'explanationLabel',
                    text: 'Explanation',
                    commandBarButtonAs: () => (<Label styles={labelStyle}>Explanation</Label>)
                }
            ]
        }

        let farItems: ICommandBarItemProps[] = []
        if (this.props.viewType == viewTypeKeys.errorAnalysisView) {
            farItems.push(
                {
                    key: 'featureList',
                    text: 'Feature List',
                    buttonStyles: buttonStyle,
                    iconProps: featureListIcon,
                    onClick: () => this.props.onFeatureListClick()
                }
            )
        }
        const helpItems: ICommandBarItemProps[] =
            [
                {
                    key: 'cohortSettings',
                    text: 'Cohort Settings',
                    buttonStyles: buttonStyle,
                    iconProps: settingsIcon,
                    onClick: () => this.props.onSettingsPanelClick()
                },
                {
                    key: 'cohortInfo',
                    text: 'Cohort Info',
                    buttonStyles: buttonStyle,
                    iconProps: infoIcon,
                    onClick: () => this.props.onInfoPanelClick()
                },
                {
                    key: 'fullscreen',
                    text: 'Fullscreen',
                    buttonStyles: buttonStyle,
                    iconProps: fullscreenIcon,
                    onClick: ()=> window.open(this.props.localUrl)
                },
            ]
        farItems.push(...helpItems)
        if (this.props.viewType == viewTypeKeys.errorAnalysisView) {
            farItems.push(
                {
                    key: 'explanation',
                    text: 'Explanation',
                    buttonStyles: buttonStyle,
                    commandBarButtonAs: () => (<PrimaryButton
                        text="Explanation"
                        styles={explanationButtonStyle}
                        onClick={this._handleExplanationButtonClicked.bind(this)}
                        allowDisabledFocus
                        disabled={false}
                        checked={false}
                      />)
                }
            )
        }
        let classNames = mainMenuStyles();
        return (
            <div className={classNames.banner}>
                <div className={classNames.mainMenu}>
                    <CommandBar
                        items={items}
                        farItems={farItems}
                        ariaLabel="Use left and right arrow keys to navigate between commands"
                    />
                </div>
            </div>
        );
    }

    private _handleExplanationButtonClicked(): void {
        this.props.viewExplanation()
    }
}