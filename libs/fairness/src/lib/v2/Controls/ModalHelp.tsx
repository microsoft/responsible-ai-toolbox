import {
  ActionButton,
  IconButton,
  IIconProps,
  ITheme,
  Modal,
  PrimaryButton
} from "office-ui-fabric-react";
import React from "react";
import { localization } from "../../Localization/localization";
import { WizardReportStyles } from "../WizardReport.styles";

interface IModalHelpProps {
  theme: ITheme;
  strings: string[];
}

export interface IState {
  showModalHelp?: boolean;
}

export class ModalHelp extends React.PureComponent<IModalHelpProps, IState> {
  public render(): React.ReactNode {
    const styles = WizardReportStyles();

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
      <div className={styles.howTo}>
        <ActionButton onClick={this.handleOpenModalHelp}>
          <div className={styles.infoButton}>i</div>
          {localization.ModelComparison.howToRead}
        </ActionButton>
        <Modal
          titleAriaId="intro modal"
          isOpen={this.state?.showModalHelp}
          onDismiss={this.handleCloseModalHelp}
          isModeless={true}
          containerClassName={styles.modalContentHelp}
        >
          <div style={{ display: "flex" }}>
            <IconButton
              styles={iconButtonStyles}
              iconProps={cancelIcon}
              ariaLabel="Close popup modal"
              onClick={this.handleCloseModalHelp}
            />
          </div>
          <p className={styles.modalContentHelpText}>
            {this.props.strings.map((text) => (
              // React.Fragment doesn’t create a wrapper element in the DOM.
              <React.Fragment>
                {text}
                <br />
                <br />
              </React.Fragment>
            ))}
          </p>
          <div style={{ display: "flex", paddingBottom: "20px" }}>
            <PrimaryButton
              className={styles.doneButton}
              onClick={this.handleCloseModalHelp}
            >
              {localization.done}
            </PrimaryButton>
          </div>
        </Modal>
      </div>
    );
  }

  private readonly handleCloseModalHelp = (): void => {
    this.setState({ showModalHelp: false });
  };

  private readonly handleOpenModalHelp = (): void => {
    this.setState({ showModalHelp: true });
  };
}
