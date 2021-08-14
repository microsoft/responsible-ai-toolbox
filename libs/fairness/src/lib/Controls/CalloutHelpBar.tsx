// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IBounds } from "@responsible-ai/core-ui";
import _ from "lodash";
import { Stack, Toggle } from "office-ui-fabric-react";
import React from "react";

import { IErrorPickerProps } from "../FairnessWizard";
import { SharedStyles } from "../Shared.styles";

import { CalloutErrorBars } from "./CalloutErrorBars";
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

    const graphInfoButtonId = "graphInfoButtonId";
    const errorBarsInfoButtonId = "errorBarInfoButtonId";

    return (
      <Stack
        horizontal
        horizontalAlign="space-between"
        className={sharedStyles.calloutBarWrapper}
      >
        <CalloutGraph
          graphInfoButtonId={graphInfoButtonId}
          graphCalloutStrings={this.props.graphCalloutStrings}
        />
        <Stack horizontal verticalAlign="center">
          <CalloutErrorBars errorBarsInfoButtonId={errorBarsInfoButtonId} />
          <Toggle
            className={sharedStyles.toggle}
            id="errorMetricDropdown"
            defaultChecked={this.props.errorPickerProps.errorBarsEnabled}
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
        </Stack>
      </Stack>
    );
  }
}
