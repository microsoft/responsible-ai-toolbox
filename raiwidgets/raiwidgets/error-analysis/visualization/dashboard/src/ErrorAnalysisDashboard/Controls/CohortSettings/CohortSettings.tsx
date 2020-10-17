import _ from "lodash";
import { cohortSettingsStyles } from "./CohortSettings.styles";
import { IFocusTrapZoneProps } from "office-ui-fabric-react/lib/FocusTrapZone";
import { Panel } from "office-ui-fabric-react/lib/Panel";
import {
  Dropdown,
  IDropdownStyles,
  IDropdownOption
} from "office-ui-fabric-react/lib/Dropdown";
import {
  CommandButton,
  IContextualMenuProps,
  IIconProps
} from "office-ui-fabric-react";
import React from "react";

export interface ICohortSettingsProps {
  isOpen: boolean;
  // hostId: string
  onDismiss: () => void;
}

const focusTrapZoneProps: IFocusTrapZoneProps = {
  isClickableOutsideFocusTrap: true,
  forceFocusInsideTrap: false
};

const cohortsList: IDropdownOption[] = [{ key: "alldata", text: "All Data" }];

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 200 }
};

const addIcon: IIconProps = { iconName: "Add" };

export class CohortSettings extends React.PureComponent<ICohortSettingsProps> {
  public render(): React.ReactNode {
    let classNames = cohortSettingsStyles();
    return (
      <Panel
        headerText="Cohort Settings"
        isOpen={this.props.isOpen}
        focusTrapZoneProps={focusTrapZoneProps}
        // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
        closeButtonAriaLabel="Close"
        // layerProps={{ hostId: this.props.hostId }}
        isBlocking={false}
        onDismiss={this.props.onDismiss}
      >
        <div className={classNames.divider}></div>
        <div className={classNames.section}>
          <div className={classNames.subsection}>
            <div className={classNames.header}>Cohort Creation</div>
            <div>
              <CommandButton iconProps={addIcon} text="New Cohort" />
            </div>
          </div>
        </div>
        <div className={classNames.divider}></div>
        <div className={classNames.section}>
          <div className={classNames.subsection}>
            <div className={classNames.header}>Cohort Info & Management</div>
            <div>
              <Dropdown
                label="Cohort List"
                options={cohortsList}
                styles={dropdownStyles}
                defaultSelectedKey={cohortsList[0].key}
              />
            </div>
          </div>
        </div>
        <div className={classNames.divider}></div>
        <div className={classNames.section}>
          <div className={classNames.subsection}>
            <div className={classNames.header}>Cohort Shift</div>
            <div>
              <Dropdown
                label="Cohort List"
                options={cohortsList}
                styles={dropdownStyles}
                defaultSelectedKey={cohortsList[0].key}
              />
            </div>
          </div>
        </div>
      </Panel>
    );
  }
}
