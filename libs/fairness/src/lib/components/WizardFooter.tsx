// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { DefaultButton, PrimaryButton } from "office-ui-fabric-react";
import React from "react";

import { WizardFooterStyles } from "./WizardFooter.styles";

export interface IWizardFooterProps {
  onNext: () => void;
  onPrevious?: () => void;
}

export class WizardFooter extends React.PureComponent<IWizardFooterProps> {
  public render(): React.ReactNode {
    const styles = WizardFooterStyles();
    return (
      <div className={styles.frame}>
        <PrimaryButton
          className={styles.next}
          text={localization.Fairness.Footer.next}
          onClick={this.props.onNext}
        />
        {!!this.props.onPrevious && (
          <DefaultButton
            className={styles.back}
            text={localization.Fairness.Footer.back}
            onClick={this.props.onPrevious}
          />
        )}
      </div>
    );
  }
}
