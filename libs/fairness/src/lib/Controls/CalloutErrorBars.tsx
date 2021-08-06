// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import { ActionButton, Stack, Text, Callout } from "office-ui-fabric-react";
import React from "react";

import { SharedStyles } from "../Shared.styles";

interface ICalloutErrorBarsProps {
  errorBarsInfoButtonId: string;
}

export interface IState {
  showErrorBarsCallout?: boolean;
}

export class CalloutErrorBars extends React.PureComponent<
  ICalloutErrorBarsProps,
  IState
> {
  public constructor(props: ICalloutErrorBarsProps) {
    super(props);
    this.state = {
      showErrorBarsCallout: false
    };
  }
  public render(): React.ReactNode {
    const sharedStyles = SharedStyles();
    return (
      <Stack className={sharedStyles.calloutWrapper}>
        <ActionButton
          className={sharedStyles.actionButton}
          onClick={this.handleOpenErrorBarsCallout}
        >
          <div
            className={sharedStyles.infoButton}
            id={this.props.errorBarsInfoButtonId}
          >
            i
          </div>
        </ActionButton>
        <span className={sharedStyles.errorCalloutHeader}>
          {localization.Fairness.DropdownHeaders.errorMetric}
        </span>
        {this.state.showErrorBarsCallout && (
          <Callout
            className={sharedStyles.callout}
            role="alertdialog"
            gapSpace={0}
            target={`#${this.props.errorBarsInfoButtonId}`}
            onDismiss={this.handleCloseErrorBarsCallout}
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
  }

  private readonly handleOpenErrorBarsCallout = (): void => {
    this.setState({ showErrorBarsCallout: true });
  };

  private readonly handleCloseErrorBarsCallout = (): void => {
    this.setState({ showErrorBarsCallout: false });
  };
}
