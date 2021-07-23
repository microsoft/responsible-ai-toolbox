// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IBounds } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import {
  ActionButton,
  ITheme,
  Stack,
  Text,
  Callout,
  Toggle
} from "office-ui-fabric-react";
import React from "react";

import { IErrorPickerPropsV2 } from "../FairnessWizard";
import { SharedStyles } from "../Shared.styles";

interface IModalHelpProps {
  theme: ITheme;
  graphCalloutStrings: string[];
  fairnessBounds?: Array<IBounds | undefined>;
  performanceBounds?: Array<IBounds | undefined>;
  outcomeBounds?: Array<IBounds | undefined>;
  falsePositiveBounds?: Array<IBounds | undefined>;
  falseNegativeBounds?: Array<IBounds | undefined>;
  errorPickerProps: IErrorPickerPropsV2;
  parentErrorChanged: {
    (event: React.MouseEvent<HTMLElement>, checked?: boolean): void;
  };
}

export interface IState {
  showGraphCallout?: boolean;
  showErrorCallout?: boolean;
}

export class ModalHelp extends React.PureComponent<IModalHelpProps, IState> {
  public constructor(props: IModalHelpProps) {
    super(props);
    this.state = {
      showErrorCallout: false,
      showGraphCallout: false
    };
  }
  public render(): React.ReactNode {
    const sharedStyles = SharedStyles();

    const graphInfoButtonId = "graphInfoButtonId";
    const errorBarInfoButtonId = "errorBarInfoButtonId";

    const graphCallout = (
      <Stack className={sharedStyles.calloutWrapper}>
        <Stack>
          <ActionButton
            className={sharedStyles.actionButton}
            onClick={this.handleOpenGraphCallout}
          >
            <div className={sharedStyles.infoButton} id={graphInfoButtonId}>
              i
            </div>
            {localization.Fairness.ModelComparison.howToRead}
          </ActionButton>
          {this.state.showGraphCallout && (
            <Callout
              className={sharedStyles.callout}
              role="alertdialog"
              gapSpace={0}
              target={`#${graphInfoButtonId}`}
              onDismiss={this.handleCloseGraphCallout}
              setInitialFocus
            >
              <Text block variant="xLarge" className={sharedStyles.title}>
                {localization.Fairness.ModelComparison.howToRead}
              </Text>

              {this.props.graphCalloutStrings.map((text, index) => (
                <Text block variant="small" key={index}>
                  {text}
                  <>
                    <br />
                    <br />
                  </>
                </Text>
              ))}
            </Callout>
          )}
        </Stack>
      </Stack>
    );

    const errorBarCallout = (
      <Stack className={sharedStyles.calloutWrapper}>
        <ActionButton
          className={sharedStyles.actionButton}
          onClick={this.handleOpenErrorCallout}
        >
          <div className={sharedStyles.infoButton} id={errorBarInfoButtonId}>
            i
          </div>
        </ActionButton>
        <span className={sharedStyles.errorCalloutHeader}>
          {localization.Fairness.DropdownHeaders.errorMetric}
        </span>
        {this.state.showErrorCallout && (
          <Callout
            className={sharedStyles.callout}
            role="alertdialog"
            gapSpace={0}
            target={`#${errorBarInfoButtonId}`}
            onDismiss={this.handleCloseErrorCallout}
            setInitialFocus
          >
            <Text block variant="xLarge" className={sharedStyles.title}>
              {localization.Fairness.ErrorBounds.howToRead}
            </Text>
            <Text block variant="small">
              {localization.Fairness.ErrorBounds.introModalText}
            </Text>
          </Callout>
        )}
      </Stack>
    );

    return (
      <Stack horizontal className={sharedStyles.calloutBarWrapper}>
        <div className={sharedStyles.graphCalloutWrapper}>{graphCallout}</div>
        <div className={sharedStyles.errorCalloutWrapper}>
          {errorBarCallout}
          <Toggle
            className={sharedStyles.toggle}
            id="errorMetricDropdown"
            defaultChecked={
              this.props.errorPickerProps.selectedErrorKey === "enabled"
            }
            disabled={
              (typeof this.props.fairnessBounds === "undefined" ||
                _.isEmpty(this.props.fairnessBounds.filter(Boolean))) &&
              (typeof this.props.performanceBounds === "undefined" ||
                _.isEmpty(this.props.performanceBounds.filter(Boolean))) &&
              (typeof this.props.outcomeBounds === "undefined" ||
                _.isEmpty(this.props.outcomeBounds.filter(Boolean))) &&
              (typeof this.props.falseNegativeBounds === "undefined" ||
                _.isEmpty(this.props.falseNegativeBounds.filter(Boolean))) &&
              (typeof this.props.falsePositiveBounds === "undefined" ||
                _.isEmpty(this.props.falsePositiveBounds.filter(Boolean)))
            }
            onChange={this.props.parentErrorChanged}
          />
        </div>
      </Stack>
    );
  }

  private readonly handleOpenErrorCallout = (): void => {
    this.setState({ showErrorCallout: true });
  };

  private readonly handleCloseErrorCallout = (): void => {
    this.setState({ showErrorCallout: false });
  };

  private readonly handleOpenGraphCallout = (): void => {
    this.setState({ showGraphCallout: true });
  };

  private readonly handleCloseGraphCallout = (): void => {
    this.setState({ showGraphCallout: false });
  };
}
