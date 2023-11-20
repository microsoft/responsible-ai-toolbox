// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DefaultButton, PrimaryButton } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { WizardFooterStyles } from "./WizardFooter.styles";

export interface IWizardFooterProps {
  nextTabKey: string;
  previousTabKey?: string;
  onSetTab: (key: string) => void;
}

export class WizardFooter extends React.PureComponent<IWizardFooterProps> {
  public render(): React.ReactNode {
    const styles = WizardFooterStyles();
    return (
      <div className={styles.frame}>
        <PrimaryButton
          className={styles.next}
          text={localization.Fairness.Footer.next}
          onClick={this.onNext}
          ariaLabel={localization.Fairness.Footer.next}
        />
        {!!this.props.previousTabKey && (
          <DefaultButton
            className={styles.back}
            text={localization.Fairness.Footer.back}
            onClick={this.onPrevious}
            ariaLabel={localization.Fairness.Footer.back}
          />
        )}
      </div>
    );
  }

  private onNext = (): void => {
    this.props.onSetTab(this.props.nextTabKey);
  };

  private onPrevious = (): void => {
    if (this.props.previousTabKey) {
      this.props.onSetTab(this.props.previousTabKey);
    }
  };
}
