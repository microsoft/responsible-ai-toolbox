// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from "@fluentui/react";
import { IBounds } from "@responsible-ai/core-ui";
import React from "react";

import { IErrorPickerProps } from "../FairnessWizard";
import { SharedStyles } from "../Shared.styles";

import { CalloutGraph } from "./CalloutGraph";

interface ICalloutHelpBarProps {
  graphCalloutStrings: string[];
  fairnessBounds?: Array<IBounds | undefined>;
  performanceBounds?: Array<IBounds | undefined>;
  outcomeBounds?: Array<IBounds | undefined>;
  falsePositiveBounds?: Array<IBounds | undefined>;
  falseNegativeBounds?: Array<IBounds | undefined>;
  errorPickerProps: IErrorPickerProps;
  parentErrorChanged: {
    (event: React.MouseEvent<HTMLElement>, checked?: boolean): void;
  };
}

export class CalloutHelpBar extends React.PureComponent<ICalloutHelpBarProps> {
  public render(): React.ReactNode {
    const sharedStyles = SharedStyles();

    return (
      <Stack
        horizontal
        horizontalAlign="space-between"
        className={sharedStyles.calloutBarWrapper}
      >
        <CalloutGraph graphCalloutStrings={this.props.graphCalloutStrings} />
        {/* <Stack horizontal verticalAlign="center">
          <CalloutErrorBars />
          <Toggle
            className={sharedStyles.toggle}
            id="errorMetricDropdown"
            defaultChecked={this.props.errorPickerProps.errorBarsEnabled}
            disabled={
              _.some(this.props.fairnessBounds, (a) => !a) &&
              _.some(this.props.performanceBounds, (a) => !a) &&
              _.some(this.props.outcomeBounds, (a) => !a) &&
              _.some(this.props.falseNegativeBounds, (a) => !a) &&
              _.some(this.props.falsePositiveBounds, (a) => !a)
            }
            onChange={this.props.parentErrorChanged}
          />
        </Stack> */}
      </Stack>
    );
  }
}
