// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from "@fluentui/react";
import { ErrorDialog } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

export interface ICounterfactualErrorDialogProps {
  errorMessage?: string;
  onClose: () => void;
}

export class CounterfactualErrorDialog extends React.PureComponent<ICounterfactualErrorDialogProps> {
  public render(): React.ReactNode {
    return (
      <Stack.Item>
        <ErrorDialog
          title={localization.Counterfactuals.ErrorDialog.PythonError}
          subText={localization.formatString(
            localization.Counterfactuals.ErrorDialog.ErrorPrefix,
            this.props.errorMessage
          )}
          cancelButtonText={localization.Counterfactuals.ErrorDialog.Close}
          onClose={this.props.onClose}
        />
      </Stack.Item>
    );
  }
}
