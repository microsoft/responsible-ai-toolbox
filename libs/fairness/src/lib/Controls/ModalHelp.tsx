// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  ActionButton,
  IconButton,
  IIconProps,
  ITheme,
  Modal,
  PrimaryButton,
  Stack
} from "office-ui-fabric-react";
import React from "react";

import { SharedStyles } from "../Shared.styles";

interface IModalHelpProps {
  theme: ITheme;
  strings: string[];
}

export interface IState {
  showModalHelp?: boolean;
}

export class ModalHelp extends React.PureComponent<IModalHelpProps, IState> {
  public render(): React.ReactNode {
    const sharedStyles = SharedStyles();

    const iconButtonStyles = {
      root: {
        color: this.props.theme.semanticColors.bodyText,
        marginLeft: "auto",
        marginRight: "2px",
        marginTop: "4px"
      },
      rootHovered: {
        color: this.props.theme.semanticColors.bodyBackgroundHovered
      }
    };

    const cancelIcon: IIconProps = { iconName: "Cancel" };

    return (
      <Stack horizontal>
        <ActionButton onClick={this.handleOpenModalHelp}>
          <div className={sharedStyles.infoButton}>i</div>
          {localization.Fairness.ModelComparison.howToRead}
        </ActionButton>
        <Modal
          titleAriaId="intro modal"
          isOpen={this.state?.showModalHelp}
          onDismiss={this.handleCloseModalHelp}
          isModeless
          containerClassName={sharedStyles.modalContentHelp}
        >
          <div style={{ display: "flex" }}>
            <IconButton
              styles={iconButtonStyles}
              iconProps={cancelIcon}
              ariaLabel="Close popup modal"
              onClick={this.handleCloseModalHelp}
            />
          </div>
          <p className={sharedStyles.modalContentHelpText}>
            {this.props.strings.map((text, index) => (
              // React.Fragment doesn’t create a wrapper element in the DOM.
              <React.Fragment key={index}>
                {text}
                <br />
                <br />
              </React.Fragment>
            ))}
          </p>
          <div style={{ display: "flex", paddingBottom: "20px" }}>
            <PrimaryButton
              className={sharedStyles.doneButton}
              onClick={this.handleCloseModalHelp}
            >
              {localization.Fairness.done}
            </PrimaryButton>
          </div>
        </Modal>
      </Stack>
    );
  }

  private readonly handleCloseModalHelp = (): void => {
    this.setState({ showModalHelp: false });
  };

  private readonly handleOpenModalHelp = (): void => {
    this.setState({ showModalHelp: true });
  };
}
