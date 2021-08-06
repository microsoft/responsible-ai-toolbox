// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import { ActionButton, Stack, Text, Callout } from "office-ui-fabric-react";
import React from "react";

import { SharedStyles } from "../Shared.styles";

interface ICalloutGraphProps {
  graphCalloutStrings: string[];
  graphInfoButtonId: string;
}

export interface IState {
  showGraphCallout?: boolean;
}

export class CalloutGraph extends React.PureComponent<
  ICalloutGraphProps,
  IState
> {
  public constructor(props: ICalloutGraphProps) {
    super(props);
    this.state = {
      showGraphCallout: false
    };
  }
  public render(): React.ReactNode {
    const sharedStyles = SharedStyles();
    return (
      <Stack className={sharedStyles.graphCalloutWrapper}>
        <Stack className={sharedStyles.calloutWrapper}>
          <Stack>
            <ActionButton
              className={sharedStyles.actionButton}
              onClick={this.handleOpenGraphCallout}
            >
              <div
                className={sharedStyles.infoButton}
                id={this.props.graphInfoButtonId}
              >
                i
              </div>
              {localization.Fairness.ModelComparison.howToRead}
            </ActionButton>
            {this.state.showGraphCallout && (
              <Callout
                className={sharedStyles.callout}
                role="alertdialog"
                gapSpace={0}
                target={`#${this.props.graphInfoButtonId}`}
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
      </Stack>
    );
  }

  private readonly handleOpenGraphCallout = (): void => {
    this.setState({ showGraphCallout: true });
  };

  private readonly handleCloseGraphCallout = (): void => {
    this.setState({ showGraphCallout: false });
  };
}
